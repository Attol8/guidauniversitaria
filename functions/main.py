from fuzzywuzzy import process
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
    cred = credentials.Certificate("../dev_firebase_config.json")
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
    print(term)

    if not term:
        # If no search term, return all courses (or first 20 if you prefer)
        return https_fn.Response(
            json.dumps(all_courses[:20]), status=200, content_type="application/json"
        )

    # Perform fuzzy search
    course_names = [course["nomeCorso"] for course in all_courses]
    fuzzy_matches = process.extract(
        term, course_names, limit=20
    )  # Increase limit to ensure we get enough unique results

    # Get the matching courses
    print(fuzzy_matches)
    results = []
    seen_ids = set()  # To keep track of unique course IDs
    for match in fuzzy_matches:
        course_name, score = match
        if score > 50:  # You can adjust this threshold
            matching_course = next(
                course for course in all_courses if course["nomeCorso"] == course_name
            )
            if (
                matching_course["id"] not in seen_ids
            ):  # Check if we've already added this course
                results.append(matching_course)
                seen_ids.add(matching_course["id"])

        if len(results) == 20:  # Stop once we have 20 unique results
            break

    # Sort results by score (highest first)
    results.sort(
        key=lambda x: process.extractOne(term, [x["nomeCorso"]])[1], reverse=True
    )
    print(results)

    return https_fn.Response(
        json.dumps(results), status=200, content_type="application/json"
    )
