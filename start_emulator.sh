#!/bin/bash

# Create a Python virtual environment in the functions directory
python3 -m venv functions/venv

# Activate the virtual environment
source functions/venv/bin/activate

# Install the required dependencies
python3 -m pip install -r functions/requirements.txt

# Start the Firebase emulators
firebase emulators:start