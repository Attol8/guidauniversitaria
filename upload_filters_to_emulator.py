#!/usr/bin/env python3
"""
Upload filter collections to Firebase emulator using REST API.
Run: python3 upload_filters_to_emulator.py
"""

import json
import requests
from collections import defaultdict

def extract_filter_data(courses):
    """Extract unique disciplines, locations, and universities from courses."""
    
    disciplines = defaultdict(lambda: {'name': '', 'coursesCounter': 0, 'courses': []})
    locations = defaultdict(lambda: {'name': '', 'coursesCounter': 0, 'courses': []})
    universities = defaultdict(lambda: {'name': '', 'coursesCounter': 0, 'courses': []})
    
    for course in courses:
        course_id = str(course.get('id'))
        
        # Extract discipline
        if 'discipline' in course and course['discipline']:
            disc_id = str(course['discipline']['id'])
            disc_name = course['discipline']['name']
            disciplines[disc_id]['name'] = disc_name
            disciplines[disc_id]['coursesCounter'] += 1
            disciplines[disc_id]['courses'].append(course_id)
        
        # Extract location
        if 'location' in course and course['location']:
            loc_id = str(course['location']['id'])
            loc_name = course['location']['name']
            locations[loc_id]['name'] = loc_name
            locations[loc_id]['coursesCounter'] += 1
            locations[loc_id]['courses'].append(course_id)
        
        # Extract university
        if 'university' in course and course['university']:
            uni_id = str(course['university']['id'])
            uni_name = course['university']['name']
            universities[uni_id]['name'] = uni_name
            universities[uni_id]['coursesCounter'] += 1
            universities[uni_id]['courses'].append(course_id)
    
    return disciplines, locations, universities

def convert_to_firestore_format(data_dict):
    """Convert data to Firestore REST API format."""
    result = {}
    
    for doc_id, data in data_dict.items():
        firestore_doc = {"fields": {}}
        
        for key, value in data.items():
            if isinstance(value, str):
                firestore_doc["fields"][key] = {"stringValue": value}
            elif isinstance(value, int):
                firestore_doc["fields"][key] = {"integerValue": str(value)}
            elif isinstance(value, list):
                firestore_doc["fields"][key] = {"arrayValue": {"values": [{"stringValue": str(item)} for item in value]}}
        
        result[doc_id] = firestore_doc
    
    return result

def upload_collection(collection_name, data_dict):
    """Upload a collection to Firebase emulator via REST API."""
    base_url = "http://localhost:8080/v1/projects/demo-project/databases/(default)/documents"
    
    print(f"Uploading {len(data_dict)} {collection_name}...")
    
    firestore_data = convert_to_firestore_format(data_dict)
    
    for doc_id, firestore_doc in firestore_data.items():
        url = f"{base_url}/{collection_name}/{doc_id}"
        response = requests.patch(url, json=firestore_doc)
        
        if response.status_code not in [200, 201]:
            print(f"Error uploading {collection_name} {doc_id}: {response.text}")
    
    print(f"✅ Uploaded {collection_name}")

def main():
    # Load course data
    print("Loading course data...")
    with open('pipelines/data/test_courses_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    courses = data.get("courses", data) if isinstance(data, dict) else data
    print(f"Found {len(courses)} courses")
    
    # Extract filter data
    print("Extracting filter collections...")
    disciplines, locations, universities = extract_filter_data(courses)
    
    print(f"Extracted:")
    print(f"  - {len(disciplines)} disciplines")
    print(f"  - {len(locations)} locations") 
    print(f"  - {len(universities)} universities")
    
    # Upload collections to emulator
    upload_collection('disciplines', disciplines)
    upload_collection('locations', locations)
    upload_collection('universities', universities)
    
    print("✅ All filter collections uploaded to emulator!")
    print("🌐 View data at: http://127.0.0.1:4000/firestore")

if __name__ == "__main__":
    main()