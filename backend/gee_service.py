# -*- coding: utf-8 -*-
"""
gee_service.py

Google Earth Engine integration layer for the Geo-Spatial AI backend.
Handles EE authentication, Sentinel-2 retrieval and NDVI-based crop
health scoring. Kept separate from app.py so Flask routes stay thin
and this logic can be reused/tested independently.
"""

import os
import ee
from google.oauth2 import service_account

GEE_PROJECT_ID = 'gen-lang-client-0942350792'
SENTINEL2_COLLECTION = 'COPERNICUS/S2_SR_HARMONIZED'

# NDVI health thresholds tuned for local (UP) agricultural patterns
NDVI_THRESHOLDS = [
    (0.2, "red", "Barren Land", "The area appears empty or barren."),
    (0.6, "yellow", "Needs Attention", "Crop greenness is low, apply water/urea. (फसल में हरा-पन कम है, पानी/यूरिया डालो। / Fasal mein hara-pan kam hai, paani/urea dalo.)"),
]
NDVI_HEALTHY_LABEL = ("green", "Excellent", "The crop is highly healthy and dense.")

# MNDWI > this threshold indicates the ROI is water (algae-covered ponds
# inflate NDVI, so water must be ruled out before trusting the NDVI advice)
MNDWI_WATER_THRESHOLD = 0.0

# SCL classes to exclude: 3 = cloud shadow, 8/9 = cloud medium/high probability,
# 10 = thin cirrus, 11 = snow/ice
SCL_MASKED_CLASSES = [3, 8, 9, 10, 11]


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
