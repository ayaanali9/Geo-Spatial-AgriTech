# -*- coding: utf-8 -*-
"""
Geo-Spatial AI Backend
Flask API for satellite-based crop health analysis over user-drawn field
boundaries. GEE logic lives in gee_service.py; this module only wires up routes.
"""

import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

import gee_service

PORT = int(os.environ.get('PORT', 5000))

gee_service.initialize_earth_engine()

# Lazily loaded Model M4 artifacts (trained via train_model.py)
CROP_MODEL_PATH = 'data/crop_model.pkl'
LABEL_ENCODER_PATH = 'data/label_encoder.pkl'
_crop_model = None
_label_encoder = None


def _get_model_and_encoder():
    """Load the XGBoost model and label encoder once, then cache them in memory."""
    global _crop_model, _label_encoder
    if _crop_model is None or _label_encoder is None:
        _crop_model = joblib.load(CROP_MODEL_PATH)
        _label_encoder = joblib.load(LABEL_ENCODER_PATH)
    return _crop_model, _label_encoder


# flask app with CORS so the vercel frontend can talk to this
app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def home():
    return f"🚀 Kisan Space Tech API is Live on Port {PORT}!"


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200


@app.route('/check_fasal', methods=['POST'])
def check_fasal():
    try:
        data = request.get_json()
        geometry = data['geometry']

        result = gee_service.analyze_field(geometry)
        return jsonify(result)

    except Exception as e:
        print("Backend Error Details:", str(e))
        return jsonify({"status": "error", "message": "Backend error — check server logs for details."})


@app.route('/api/live-rgb', methods=['POST'])
def live_rgb():
    try:
        data = request.get_json()
        geometry = data['geometry']

        tile_url = gee_service.get_live_rgb_tile(geometry)
        return jsonify({"status": "success", "tile_url": tile_url})

    except Exception as e:
        print("Live RGB Error Details:", str(e))
        return jsonify({"status": "error", "message": "Could not fetch live satellite imagery — check server logs for details."})


@app.route('/api/predict_crop', methods=['POST'])
def predict_crop():
    try:
        data = request.get_json()
        geometry = data['geometry']

        features = gee_service.get_field_features(geometry)

        model, label_encoder = _get_model_and_encoder()
        features_df = pd.DataFrame([features])[gee_service.ADVANCED_FEATURE_COLUMNS]

        # GEE can return null/string values over water or nodata pixels — coerce to numeric for XGBoost
        features_df = features_df.astype(float)
        features_df.fillna(0, inplace=True)

        predicted_label = model.predict(features_df)[0]
        predicted_crop = label_encoder.inverse_transform([predicted_label])[0]

        return jsonify({
            "status": "success",
            "predicted_crop": predicted_crop,
            "features": features
        })

    except gee_service.PermanentWaterError as e:
        # Expected, user-facing rejection (river/canal drawn instead of a field) — not a server fault
        return jsonify({"status": "error", "message": str(e)})

    except Exception as e:
        print("Predict Crop Error Details:", str(e))
        return jsonify({"status": "error", "message": "Could not predict crop — check server logs for details."})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)