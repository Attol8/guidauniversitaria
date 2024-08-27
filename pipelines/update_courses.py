"""Script to take a JSON file of (already processed) course data and upload it to Firestore and Cloud Storage."""

import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
import grpc
import json
from google.cloud.firestore_v1.services.firestore import FirestoreClient
from google.cloud.firestore_v1.services.firestore.transports import (
    FirestoreGrpcTransport,
)

# Determine the environment and load the appropriate .env file
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
    json_courses_path = "pipelines/data/test_courses_data.json"

else:
    firebase_app = firebase_admin.initialize_app(
        {"storageBucket": "prod_project_id.appspot.com"}
    )
    db = firestore.client(app=firebase_app)
    json_courses_path = "pipelines/data/all_courses_data.json"


def save_to_firestore(courses):
    collection_ref = db.collection("courses")
    for course in courses:
        # Use the 'id' field from the course data as the document ID
        doc_id = str(course.get("id"))
        if doc_id:
            doc_ref = collection_ref.document(doc_id)
            doc_ref.set(course)
        else:
            print("Course data is missing 'id' field:", course)
    print("Data has been written to Firestore.")


def upload_json_to_storage(local_file_path, storage_path):
    bucket = storage.bucket()
    blob = bucket.blob(storage_path)
    blob.upload_from_filename(local_file_path)
    print(f"File {local_file_path} uploaded to {storage_path}.")


if __name__ == "__main__":
    all_courses = json.load(open(json_courses_path))["courses"]
    save_to_firestore(all_courses)
    upload_json_to_storage(json_courses_path, "all_courses_data.json")
