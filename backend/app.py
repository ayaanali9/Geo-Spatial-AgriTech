# -*- coding: utf-8 -*-
"""
Geo-Spatial AI Backend
Flask API for satellite-based crop health analysis.
Processes Sentinel-2 imagery for NDVI scoring around Tajpura, Saharanpur.
"""

import matplotlib
matplotlib.use('Agg')
import ee
import geemap

import os
from google.oauth2 import service_account

# connecting to Google Earth Engine with service account if available
try:
    if os.path.exists('ee-key.json'):
        credentials = service_account.Credentials.from_service_account_file('ee-key.json')
        scoped_credentials = credentials.with_scopes(['https://www.googleapis.com/auth/earthengine'])
        ee.Initialize(scoped_credentials, project='gen-lang-client-0942350792')
    else:
        ee.Initialize(project='gen-lang-client-0942350792')
    print("Earth Engine Initialized Successfully!")
except Exception as e:
    print("Earth Engine Auth Error:", str(e))

# tajpura area — 10km buffer around my village
tajpura_center = [77.585, 29.957]
tajpura_area = ee.Geometry.Point(tajpura_center).buffer(10000)

# pulling latest sentinel-2 imagery with low cloud cover
image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
          .filterBounds(tajpura_area) \
          .filterDate('2026-03-01', '2026-05-01') \
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
          .median() \
          .clip(tajpura_area)

# ndvi = how green the crop is (higher = healthier)
ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')

# geemap visualization setup
Map = geemap.Map(basemap='HYBRID')
Map.centerObject(ee.Geometry.Point(tajpura_center), 15)

# adding the satellite view and ndvi health overlay
rgb_params = {'min': 0, 'max': 3000, 'bands': ['B4', 'B3', 'B2']}
ndvi_palette = ['red', 'orange', 'yellow', 'lightgreen', 'darkgreen']
ndvi_params = {'min': 0, 'max': 0.8, 'palette': ndvi_palette}

Map.addLayer(image, rgb_params, 'Normal Khet (RGB)')
Map.addLayer(ndvi, ndvi_params, 'AI Health Map (NDVI)')

Map

import ee

roi = Map.user_roi

if roi is None:
    print("❌ Error: Khet ki boundary nahi mili! Pehle map par draw karein.")
else:
    print("⏳ Data Science Engine: Aasmaan se sabse LATEST photo nikal raha hai...\n")

    try:

        latest_image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(roi) \
            .filterDate('2026-04-01', '2026-05-02') \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) \
            .sort('system:time_start', False) \
            .first()

        image_date = latest_image.date().format('dd-MM-YYYY').getInfo()
        latest_ndvi = latest_image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        stats = latest_ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=roi,
            scale=10,
            maxPixels=1e9
        ).getInfo()

        raw_score = stats.get('NDVI')

        if raw_score is None:
            print("⚠️ Pichle 1 mahine mein is jagah par lagatar baadal the, latest clear photo nahi mili.")
        else:
            score = round(raw_score, 2)

            print("="*60)
            print("             🌾 TUMHARE KHET KI 'LIVE' HEALTH REPORT 🌾")
            print("="*60)
            print(f"📅 Photo Kheechi Gayi: {image_date} (Yeh tera Live Status hai!)")
            print(f"📊 Average NDVI Score: {score}  (Scale: -1.0 to +1.0)")

            # health thresholds tuned for tajpura's local soil
            print("\n🤖 AI Health Analysis:")
            if score < 0.2:
                print("🔴 Status: Banjar ya Paani (Bare Soil / Water)")
                print("💡 Advice: Zameen poori tarah se banjar hai, ya khet mein sirf paani bhara hua hai.")
            elif score < 0.4:
                print("🟠 Status: Khet Khali Hai / Kati hui Fasal (Harvested / Empty)")
                print("💡 Advice: Lagta hai fasal (jaise gehu) kat chuki hai aur khet abhi khali hai. Ya fir agar nayi fasal boi hai, toh woh abhi bohot choti hai.")
            elif score < 0.65:
                print("🟡 Status: Moderate / Needs Attention")
                print("💡 Advice: Fasal theek hai par patton mein hara-pan kam hai. Paani ya urea/khad ki zaroorat ho sakti hai.")
            else:
                print("🟢 Status: Excellent / Healthy Crop")
                print("💡 Advice: Fasal ekdum top class, ghaney patto wali aur completely healthy hai!")
            print("="*60)

    except Exception as e:
        print(f"❌ Technical Error aa gaya. Details: {e}")

import os
import ee
from google.oauth2 import service_account
from flask import Flask, request, jsonify
from flask_cors import CORS

PORT = int(os.environ.get('PORT', 5000))

# earth engine auth — uses service account key on render, fallback for local dev
try:
    if os.path.exists('ee-key.json'):
        credentials = service_account.Credentials.from_service_account_file('ee-key.json')
        scoped_credentials = credentials.with_scopes(['https://www.googleapis.com/auth/earthengine'])
        ee.Initialize(scoped_credentials, project='gen-lang-client-0942350792')
    else:
        ee.Initialize(project='gen-lang-client-0942350792')
    print("Earth Engine Initialized Successfully!")
except Exception as e:
    print("Earth Engine Auth Error:", str(e))

# flask app with CORS so the vercel frontend can talk to this
app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return f"🚀 Kisan Space Tech API is Live on Port {PORT}!"

@app.route('/check_fasal', methods=['POST'])
def check_fasal():
    try:
        # getting the field boundary coordinates from the frontend
        data = request.get_json()
        coords = data['geometry']

        # converting to earth engine geometry
        roi = ee.Geometry(coords)

        # fetching latest clear satellite image for this area
        latest_image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(roi) \
            .filterDate('2026-04-01', '2026-05-02') \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) \
            .sort('system:time_start', False) \
            .first()

        # calculating ndvi — tells us how healthy the vegetation is
        latest_ndvi = latest_image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        stats = latest_ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=roi,
            scale=10,
            maxPixels=1e9
        ).getInfo()

        raw_score = stats.get('NDVI')

        if raw_score is None:
            return jsonify({"status": "error", "message": "Satellite data unavailable due to heavy cloud cover."})

        score = round(raw_score, 2)

        # health classification — thresholds based on UP agricultural patterns
        advice = ""
        if score < 0.2:
            advice = "🔴 Banjar ya Paani: Zameen khali ya banjar hai."
        elif score < 0.4:
            advice = "🟠 Khet Khali Hai: Fasal kat chuki hai ya bhot choti hai."
        elif score < 0.65:
            advice = "🟡 Needs Attention: Fasal mein hara-pan kam hai, paani/urea dalo."
        else:
            advice = "🟢 Excellent: Fasal ekdum top class aur healthy hai!"

        return jsonify({
            "status": "success",
            "score": score,
            "advice": advice
        })

    except Exception as e:
        print("Backend Error Details:", str(e))
        return jsonify({"status": "error", "message": "Backend error — check server logs for details."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)