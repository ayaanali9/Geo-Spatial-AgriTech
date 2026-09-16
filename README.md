# Geo-Spatial AgriTech

A satellite-assisted precision agriculture platform that combines **remote sensing, geospatial data, and machine learning** to support crop-health monitoring and field-level agricultural analysis.

> **Research + Engineering Project**
>
> Built around Sentinel-2 satellite data, Google Earth Engine, machine-learning-based crop analysis, and spatial indicators for practical agricultural decision support.

## Live Demo

**Web App:** https://geo-spatial-agri-tech.vercel.app/

## Project Overview

Geo-Spatial AgriTech is designed to turn satellite and geospatial measurements into interpretable agricultural insights. The platform combines a map-based interface with an Earth-observation processing pipeline so users can select an area of interest and analyze satellite-derived indicators.

The project focuses on a practical question:

**How can machine learning and satellite-derived spatial features be used to make crop monitoring more robust to geographic, spectral, and environmental variation?**

## Research Focus

The research component of this project studies the behavior of **closed-world XGBoost crop classification** when the deployment environment differs from the training distribution.

The current research manuscript is:

**Spatial and Spectral Failure Modes of Closed-World XGBoost Crop Classification Using Sentinel-2 Data**

**Author:** Ayaan Ali (First Author), Mohd Firoj

**Status:** Research manuscript submitted for review

### Research keywords

`XGBoost` · `Sentinel-2` · `Remote Sensing` · `Out-of-Distribution Detection` · `Spatial Transferability` · `Crop Classification` · `Geospatial Machine Learning`

## Research Motivation

Satellite-based crop classification can perform well when training and deployment data come from similar geographic and spectral conditions. However, performance can degrade when a model encounters environments that differ from those represented during training.

This project investigates such failure modes and examines how spatial, spectral, hydrological, and vegetation-related variation can affect model predictions.

## Satellite & Geospatial Data

The platform and research pipeline use Earth-observation and geospatial datasets including:

- **Sentinel-2** optical satellite data for vegetation and surface information
- **SRTM** elevation data for terrain-related features
- **SoilGrids** soil-property information
- Spatial field/region boundaries and geographic coordinates

## Feature Engineering

The research pipeline uses satellite- and geospatial-derived features such as:

- **NDVI** — vegetation condition
- **MNDWI** — water-body identification and masking
- **EVI** — enhanced vegetation response
- **SAVI** — vegetation index with soil-background adjustment
- **NDTI** — additional spectral information
- **Elevation / terrain information** from SRTM
- **Soil properties** from SoilGrids

## The “Pond Bug”

A practical failure case observed during development was the misclassification of algae- or aquatic-vegetation-covered ponds as healthy crops.

The issue occurs because vegetation indices such as NDVI can become strongly positive when water bodies contain dense aquatic vegetation.

To reduce this false-positive behavior, the pipeline incorporates **MNDWI-based water masking** so that water-dominated areas can be separated from terrestrial crop responses before classification and interpretation.

## Machine Learning

The baseline research model is **XGBoost**.

The baseline experiment uses a feature set derived from Sentinel-2 optical indicators together with terrain and soil information. The current baseline evaluation achieved **76.47% accuracy** on the evaluation dataset.

The research also investigates how model behavior changes under distribution shift rather than evaluating accuracy only inside a closed-world training/test setting.

## Key Research Question

A central objective is to understand whether high in-distribution accuracy necessarily implies reliable performance when the model is deployed across:

- different geographic regions,
- different environmental conditions,
- water-dominated or aquatic-vegetation settings, and
- spectrally different agricultural surfaces.

## System Architecture

The application is organized into three main layers:

```text
User Interface
    |
    v
React + Leaflet
    |
    v
Python / Flask Backend
    |
    v
Google Earth Engine
    |
    +--> Sentinel-2
    +--> SRTM
    +--> SoilGrids
    |
    v
Feature Extraction / Analysis
    |
    v
ML + Agricultural Insights
```

## Technology Stack

### Frontend

- React
- Leaflet
- JavaScript
- HTML/CSS
- Google Maps / satellite basemap integration

### Backend & Processing

- Python
- Flask — backend/API framework
- Google Earth Engine Python API — satellite data processing
- REST APIs

### Deployment

- Vercel — frontend deployment
- Render — backend deployment
- Uptime monitoring — backend availability

### Machine Learning & Data Science

- XGBoost
- Pandas
- NumPy
- Scikit-learn
- Matplotlib

### Deployment

- Vercel — frontend
- Render — backend
- Uptime monitoring for backend availability

## Repository Structure

```text
Geo-Spatial-AgriTech/
├── backend/                  # Flask backend and processing services
├── src/                      # React application source
├── public/                   # Frontend assets
├── IEEE_Supplementary_Data/  # Research-related supplementary data
├── Architecture.md           # System architecture documentation
├── .env.example              # Environment variable template
├── package.json              # Frontend dependencies/scripts
└── README.md                 # Project documentation
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ayaanali9/Geo-Spatial-AgriTech.git
cd Geo-Spatial-AgriTech
```

### 2. Frontend setup

```bash
npm install
npm run dev
```

### 3. Backend setup

Create the required environment variables using `.env.example`, then install the Python dependencies listed by the backend.

```bash
python -m venv .venv
```

Activate the environment and install the required packages before starting the Flask service.

> Configuration details may vary depending on the local Google Earth Engine authentication and deployment environment.

## Reproducibility

The repository contains research-related supplementary data and architecture documentation. Experimental results should be interpreted together with the manuscript and the dataset split/experimental setup used for each evaluation.

## Research Takeaway

The project is not intended to treat classification accuracy as the only measure of model quality. A model can perform strongly on data that resembles its training distribution and still produce implausible predictions under geographic or environmental shift.

The research therefore emphasizes **failure-mode analysis, spatial transferability, and robustness under distribution change**.

## Project Status

**Active research and development**

- Web platform: deployed
- Baseline ML pipeline: implemented
- Research manuscript: submitted for review
- Further experiments: ongoing

## Author

**Ayaan Ali**  
B.Tech Computer Science (Data Science), Quantum University, India

- GitHub: https://github.com/ayaanali9
- LinkedIn: https://linkedin.com/in/ayaanali9

## Collaborator

**Mohd Firoj** — Geotechnical & Structural Engineering / research collaborator

## Disclaimer

This project is a research and engineering prototype. Agricultural decisions should not be based solely on automated predictions from this system; field observations and domain expertise remain important for validation.
