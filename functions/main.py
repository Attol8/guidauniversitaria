import firebase_admin
from firebase_admin import credentials, firestore, storage
from firebase_functions import firestore_fn, https_fn
from google.cloud.firestore_v1.services.firestore import FirestoreClient
from google.cloud.firestore_v1.services.firestore.transports import (
    FirestoreGrpcTransport,
)
from google.api_core.exceptions import NotFound
from flask_cors import cross_origin

import grpc
import json
import os

env = "development"
if env == "development":
    cred = credentials.Certificate("dev_firebase_config.json")
    firebase_app = firebase_admin.initialize_app(
        cred, {"storageBucket": "guidauniversitaria.appspot.com"}
    )
    os.environ["STORAGE_EMULATOR_HOST"] = "http://127.0.0.1:9199"
    db = firestore.client(app=firebase_app)

    # Create a channel and transport for Firestore client
    channel = grpc.insecure_channel("localhost:8080")
    transport = FirestoreGrpcTransport(channel=channel)
    db._firestore_api_internal = FirestoreClient(transport=transport)


# Function to load courses from Firebase Storage
def load_courses_from_storage():
    bucket = storage.bucket()
    blob = bucket.blob("all_courses_data.json")

    try:
        json_data = blob.download_as_text()
        all_courses = json.loads(json_data)["courses"]
    except NotFound:
        print("File not found. Creating a new file or returning default data.")
        # You can create a default file or return default data here
        all_courses = []

    return all_courses


all_courses = load_courses_from_storage()


@https_fn.on_request()
@cross_origin(origins=["http://localhost:3000"], methods=["GET", "OPTIONS"])
def search_courses(request: https_fn.Request) -> https_fn.Response:
    term = request.args.get("term", "").lower()
    if not term:
        # If no search term, return all courses (or first 20 if you prefer)
        return https_fn.Response(
            json.dumps(all_courses[:20]), status=200, content_type="application/json"
        )
    # Perform simple search (you can implement more complex search logic here)
    results = [course for course in all_courses if term in course["nomeCorso"].lower()]

    # Sort results (you can implement more sophisticated sorting if needed)
    results.sort(key=lambda x: x["nomeCorso"])
    print(results)

    return https_fn.Response(
        json.dumps(results[:20]), status=200, content_type="application/json"
    )
