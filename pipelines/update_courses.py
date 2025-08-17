"""Script to take a JSON file of (already processed) course data and upload it to Firestore and Cloud Storage."""

import os
import firebase_admin
from firebase_admin import credentials, firestore
import json
import argparse

def initialize_firebase(use_emulator=True):
    """Initialize Firebase with emulator or production settings."""
    if not firebase_admin._apps:
        if use_emulator:
            # Use emulator for local development
            os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
            firebase_admin.initialize_app(options={'projectId': 'guidauniversitaria'})
        else:
            # Try service account file first, then fall back to Application Default Credentials
            service_account_path = ".firebase-credentials.json"
            if os.path.exists(service_account_path):
                print(f"Using service account: {service_account_path}")
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                print("Service account not found. Please create one:")
                print("1. Go to: https://console.firebase.google.com/project/guidauniversitaria/settings/serviceaccounts/adminsdk")
                print("2. Click 'Generate new private key'")
                print("3. Save as: .firebase-credentials.json")
                return None
    
    return firestore.client()


def save_to_firestore(courses, db):
    """Upload courses to Firestore."""
    collection_ref = db.collection("courses")
    
    print(f"Uploading {len(courses)} courses...")
    
    for i, course in enumerate(courses):
        doc_id = str(course.get("id"))
        if doc_id:
            doc_ref = collection_ref.document(doc_id)
            doc_ref.set(course)
            if (i + 1) % 100 == 0:
                print(f"Uploaded {i + 1}/{len(courses)} courses...")
        else:
            print(f"Course missing 'id' field: {course}")
    
    print("✅ Data uploaded to Firestore!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Upload course data to Firebase')
    parser.add_argument('--env', choices=['development', 'production'], 
                       default='development', help='Environment to upload to')
    args = parser.parse_args()
    
    # Initialize Firebase - always use production mode (no emulator)
    db = initialize_firebase(use_emulator=False)
    
    if db is None:
        print("❌ Could not initialize Firebase. Please create a service account key.")
        exit(1)
    
    # Load data
    data_file = "pipelines/data/test_courses_data.json" if args.env == 'development' else "pipelines/data/all_courses_data.json"
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    courses = data.get("courses", data) if isinstance(data, dict) else data
    save_to_firestore(courses, db)
