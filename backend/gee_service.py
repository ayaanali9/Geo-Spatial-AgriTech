# -*- coding: utf-8 -*-
"""
gee_service.py

Google Earth Engine integration layer for the Geo-Spatial AI backend.
Handles EE authentication, Sentinel-2 retrieval and NDVI-based crop
health scoring. Kept separate from app.py so Flask routes stay thin
and this logic can be reused/tested independently.
"""

import os
from datetime import datetime, timedelta
import ee
from google.oauth2 import service_account

GEE_PROJECT_ID = 'gen-lang-client-0942350792'
SENTINEL2_COLLECTION = 'COPERNICUS/S2_SR_HARMONIZED'
LIVE_RGB_COLLECTION = 'COPERNICUS/S2_HARMONIZED'

# NDVI health thresholds tuned for local (UP) agricultural patterns
NDVI_THRESHOLDS = [
    (0.2, "red", "Barren Land", "The area appears empty or barren. (Zameen khali ya banjar lag rahi hai.)"),
    (0.6, "yellow", "Needs Attention", "Crop greenness is low, apply water/urea. (Fasal mein hara-pan kam hai, paani/urea dalo.)"),
]
NDVI_HEALTHY_LABEL = ("green", "Excellent", "The crop is highly healthy and dense. (Fasal ekdum swasth aur ghani hai.)")

# MNDWI > this threshold indicates the ROI is water (algae-covered ponds
# inflate NDVI, so water must be ruled out before trusting the NDVI advice)
MNDWI_WATER_THRESHOLD = 0.0

# SCL classes to exclude: 3 = cloud shadow, 8/9 = cloud medium/high probability,
# 10 = thin cirrus, 11 = snow/ice
SCL_MASKED_CLASSES = [3, 8, 9, 10, 11]

# Model M5 feature set (must match the training columns in train_global_master.py) -
# order matters less than completeness for the sklearn API, but this mirrors the training script exactly.
ADVANCED_FEATURE_COLUMNS = ['NDVI', 'MNDWI', 'elevation', 'slope', 'aspect', 'clay', 'sand', 'soc', 'bdod', 'EVI', 'SAVI', 'NDTI']

# JRC Global Surface Water 'occurrence' band (% of time 1984-2021 a pixel was water) - used to
# reject rivers/canals before they ever reach the crop classifier (early-stage flooded rice can
# otherwise mimic their high-MNDWI/low-NDVI signature).
JRC_GSW_ASSET = 'JRC/GSW1_4/GlobalSurfaceWater'
# Lowered from 50: seasonal canals/rivers can have a 38-year mean 'occurrence' well below
# 50% even though they are clearly water, so this alone is no longer relied on in isolation.
WATER_OCCURRENCE_THRESHOLD = 10
# 'max_extent' is a binary band (1 = water was observed at least once in 1984-2021). Any
# meaningful fraction of a field covered by it means the polygon overlaps a river/canal bed.
WATER_MAX_EXTENT_FRACTION_THRESHOLD = 0.10


class PermanentWaterError(Exception):
    """Raised when a drawn field boundary is dominated by permanent water (river/canal/pond)."""
    pass


def initialize_earth_engine():
    """Authenticate with GEE using a service account key if present, else default credentials."""
    try:
        if os.path.exists('ee-key.json'):
            credentials = service_account.Credentials.from_service_account_file('ee-key.json')
            scoped_credentials = credentials.with_scopes(['https://www.googleapis.com/auth/earthengine'])
            ee.Initialize(scoped_credentials, project=GEE_PROJECT_ID)
        else:
            ee.Initialize(project=GEE_PROJECT_ID)
        print("Earth Engine Initialized Successfully!")
    except Exception as e:
        print("Earth Engine Auth Error:", str(e))


def _classify_ndvi(score):
    """Map an NDVI score to a status emoji/label/advice string."""
    for threshold, emoji_color, status, message in NDVI_THRESHOLDS:
        if score < threshold:
            emoji = {"red": "🔴", "yellow": "🟡"}[emoji_color]
            return f"{emoji} {status}: {message}"
    emoji_color, status, message = NDVI_HEALTHY_LABEL
    return f"🟢 {status}: {message}"


def _mask_clouds_and_snow(image):
    """Mask cloud, cloud-shadow and snow pixels using the Sentinel-2 SCL band."""
    scl = image.select('SCL')
    clear_mask = scl.remap(SCL_MASKED_CLASSES, [0] * len(SCL_MASKED_CLASSES), 1)
    return image.updateMask(clear_mask)


def analyze_field(geometry):
    """
    Compute the latest NDVI-based health score for a field boundary.

    Args:
        geometry: GeoJSON geometry dict (e.g. a Polygon) drawn by the user.

    Returns:
        dict with either {"status": "success", "score": float, "advice": str}
        or {"status": "error", "message": str}.
    """
    roi = ee.Geometry(geometry)

    latest_image = ee.ImageCollection(SENTINEL2_COLLECTION) \
        .filterBounds(roi) \
        .filterDate('2026-04-01', '2026-05-02') \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) \
        .sort('system:time_start', False) \
        .first()

    clear_image = _mask_clouds_and_snow(latest_image)
    latest_ndvi = clear_image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    latest_mndwi = clear_image.normalizedDifference(['B3', 'B11']).rename('MNDWI')

    stats = latest_ndvi.addBands(latest_mndwi).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=roi,
        scale=10,
        maxPixels=1e9
    ).getInfo()

    raw_score = stats.get('NDVI')
    raw_mndwi = stats.get('MNDWI')

    if raw_score is None or raw_mndwi is None:
        return {"status": "error", "message": "Satellite data unavailable due to heavy cloud cover."}

    score = round(raw_score, 2)
    mndwi_score = round(raw_mndwi, 2)
    is_water = mndwi_score > MNDWI_WATER_THRESHOLD

    return {
        "status": "success",
        "score": score,
        "mndwi": mndwi_score,
        "is_water": is_water,
        "advice": "Water Body Detected (MNDWI > 0). Crop analysis is not applicable here." if is_water else _classify_ndvi(score)
    }


def get_live_rgb_tile(geometry):
    """
    Fetch a live true-color (RGB) tile URL for the most recent cloud-free
    Sentinel-2 image covering the given field boundary.

    Args:
        geometry: GeoJSON geometry dict (e.g. a Polygon) drawn by the user.

    Returns:
        The XYZ tile URL template (str) for the true-color image.
    """
    roi = ee.Geometry(geometry)

    latest_image = ee.ImageCollection(LIVE_RGB_COLLECTION) \
        .filterBounds(roi) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) \
        .sort('system:time_start', False) \
        .first()

    map_id = latest_image.getMapId({'bands': ['B4', 'B3', 'B2'], 'min': 0, 'max': 3000})
    return map_id['tile_fetcher'].url_format


def _check_permanent_water(roi):
    """
    Raise PermanentWaterError if the ROI overlaps a JRC GSW water body, checked two ways:
    mean 'occurrence' (%) exceeding WATER_OCCURRENCE_THRESHOLD, or the fraction of the ROI
    ever covered by 'max_extent' exceeding WATER_MAX_EXTENT_FRACTION_THRESHOLD. The second
    check catches seasonal canals/rivers whose long-run mean occurrence is deceptively low.

    Args:
        roi: ee.Geometry to check.
    """
    gsw = ee.Image(JRC_GSW_ASSET).select(['occurrence', 'max_extent'])
    stats = gsw.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=roi,
        scale=30,
        maxPixels=1e9
    ).getInfo()

    # Both bands are unset (None) where a pixel was never observed as water - treat that as 0
    mean_occurrence = stats.get('occurrence') or 0
    max_extent_fraction = stats.get('max_extent') or 0

    if (mean_occurrence > WATER_OCCURRENCE_THRESHOLD or
            max_extent_fraction > WATER_MAX_EXTENT_FRACTION_THRESHOLD):
        raise PermanentWaterError(
            "Permanent water body (river/canal) detected. Please select an agricultural field."
        )


def get_field_features(geojson_polygon):
    """
    Extract the 12 Model M5 features for a single field boundary, using the
    same Sentinel-2 / SRTM / SoilGrids logic as extract_global_features.py.

    Args:
        geojson_polygon: GeoJSON geometry dict (e.g. a Polygon) drawn by the user.

    Returns:
        dict mapping each of ADVANCED_FEATURE_COLUMNS to its mean value over the field.

    Raises:
        PermanentWaterError: if the field is dominated by permanent water (river/canal).
    """
    roi = ee.Geometry(geojson_polygon)

    # Reject rivers/canals/lakes up front so a flooded field never reaches the classifier
    _check_permanent_water(roi)

    # DEM + terrain metrics (slope, aspect) derived from the SRTM DEM
    dem = ee.Image('USGS/SRTMGL1_003').select('elevation')
    terrain = ee.Terrain.products(dem)
    slope = terrain.select('slope')
    aspect = terrain.select('aspect')

    # Sentinel-2 median composite over the last 6 months (cloud-filtered)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)
    s2 = ee.ImageCollection(SENTINEL2_COLLECTION) \
        .filterBounds(roi) \
        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
        .median()

    ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI')
    mndwi = s2.normalizedDifference(['B3', 'B11']).rename('MNDWI')

    # Advanced spectral indices (must match extract_global_features.py exactly)
    # EVI/SAVI need reflectance in 0-1, so reflectance bands are scaled down from S2 SR's 0-10000 range
    evi = s2.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        {
            'NIR': s2.select('B8').divide(10000),
            'RED': s2.select('B4').divide(10000),
            'BLUE': s2.select('B2').divide(10000),
        }
    ).rename('EVI')

    savi = s2.expression(
        '((NIR - RED) / (NIR + RED + L)) * (1 + L)',
        {
            'NIR': s2.select('B8').divide(10000),
            'RED': s2.select('B4').divide(10000),
            'L': 0.5,
        }
    ).rename('SAVI')

    # NDTI (Normalized Difference Tillage Index) highlights crop residue/soil tillage using the two SWIR bands
    ndti = s2.normalizedDifference(['B11', 'B12']).rename('NDTI')

    # SoilGrids topsoil layer (0-5cm)
    clay = ee.Image('projects/soilgrids-isric/clay_mean').select('clay_0-5cm_mean').rename('clay')
    sand = ee.Image('projects/soilgrids-isric/sand_mean').select('sand_0-5cm_mean').rename('sand')
    soc = ee.Image('projects/soilgrids-isric/soc_mean').select('soc_0-5cm_mean').rename('soc')
    bdod = ee.Image('projects/soilgrids-isric/bdod_mean').select('bdod_0-5cm_mean').rename('bdod')

    analysis_image = dem.addBands(ndvi) \
        .addBands(mndwi) \
        .addBands(slope) \
        .addBands(aspect) \
        .addBands(clay) \
        .addBands(sand) \
        .addBands(soc) \
        .addBands(bdod) \
        .addBands(evi) \
        .addBands(savi) \
        .addBands(ndti)

    stats = analysis_image.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=roi,
        scale=10,
        maxPixels=1e9
    ).getInfo()

    return {col: stats.get(col) for col in ADVANCED_FEATURE_COLUMNS}
