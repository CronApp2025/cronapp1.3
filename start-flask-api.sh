#!/bin/bash

echo "Starting Flask API server..."
cd api
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
python -m flask run --host=0.0.0.0