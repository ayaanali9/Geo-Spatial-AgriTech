# -*- coding: utf-8 -*-
"""
Geo-Spatial AI Backend
Flask API for satellite-based crop health analysis over user-drawn field
boundaries. GEE logic lives in gee_service.py; this module only wires up routes.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

import gee_service

PORT = int(os.environ.get('PORT', 5000))

gee_service.initialize_earth_engine()

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)