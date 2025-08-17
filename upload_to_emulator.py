#!/usr/bin/env python3
"""
Upload course data to Firebase emulator using REST API.
Run: python3 upload_to_emulator.py
"""

import json
import requests

def upload_courses():
    """Upload courses to Firebase emulator via REST API."""
    
    print("Loading test course data...")
    with open('pipelines/data/test_courses_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    courses = data.get("courses", data) if isinstance(data, dict) else data
    print(f"Found {len(courses)} courses to upload to emulator")
    
    # Firebase emulator REST API base URL
    base_url = "http://localhost:8080/v1/projects/demo-project/databases/(default)/documents"
    
    print("Uploading courses to emulator...")
    
    for i, course in enumerate(courses):
        doc_id = str(course.get("id", i))
        
        # Prepare the document data for Firestore REST API
        firestore_doc = {
            "fields": {}
        }
        
        # Convert course data to Firestore field format
        for key, value in course.items():
            if isinstance(value, str):
                firestore_doc["fields"][key] = {"stringValue": value}
            elif isinstance(value, int):
                firestore_doc["fields"][key] = {"integerValue": str(value)}
            elif isinstance(value, float):
                firestore_doc["fields"][key] = {"doubleValue": value}
            elif isinstance(value, bool):
                firestore_doc["fields"][key] = {"booleanValue": value}
            elif isinstance(value, dict):
                firestore_doc["fields"][key] = {"stringValue": json.dumps(value)}
            elif isinstance(value, list):
                firestore_doc["fields"][key] = {"stringValue": json.dumps(value)}
            else:
                firestore_doc["fields"][key] = {"stringValue": str(value)}
        
        # Upload to emulator
        url = f"{base_url}/courses/{doc_id}"
        response = requests.patch(url, json=firestore_doc)
        
        if response.status_code not in [200, 201]:
            print(f"Error uploading course {doc_id}: {response.text}")
        elif (i + 1) % 10 == 0:
            print(f"  Uploaded {i + 1}/{len(courses)} courses...")
    
    print(f"✅ Successfully uploaded {len(courses)} courses to emulator!")
    print("🌐 View data at: http://127.0.0.1:4000/firestore")

if __name__ == "__main__":
    upload_courses()