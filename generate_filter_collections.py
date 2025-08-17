#!/usr/bin/env python3
"""
Generate filter collections (disciplines, locations, universities) from course data
and upload to Firebase for the hosted app.
"""

import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
from collections import defaultdict

def initialize_firebase():
    """Initialize Firebase with service account."""
    if not firebase_admin._apps:
        service_account_path = ".firebase-credentials.json"
        if os.path.exists(service_account_path):
            print(f"Using service account: {service_account_path}")
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            print("❌ Service account not found. Need .firebase-credentials.json")
            return None
    
    return firestore.client()

def extract_filter_data(courses):
    """Extract unique disciplines, locations, and universities from courses."""
    
    disciplines = defaultdict(lambda: {'name': '', 'coursesCounter': 0, 'courses': []})
    locations = defaultdict(lambda: {'name': '', 'coursesCounter': 0, 'courses': []})
    universities = defaultdict(lambda: {'name': '', 'coursesCounter': 0, 'courses': []})
    
    for course in courses:
        course_id = str(course.get('id'))
        course_name = course.get('nomeCorso', '')
        
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

def upload_collection(db, collection_name, data_dict):
    """Upload a collection to Firestore."""
    print(f"Uploading {len(data_dict)} {collection_name}...")
    
    collection_ref = db.collection(collection_name)
    
    for doc_id, data in data_dict.items():
        doc_ref = collection_ref.document(doc_id)
        doc_ref.set(data)
    
    print(f"✅ Uploaded {collection_name}")

def main():
    # Initialize Firebase
    db = initialize_firebase()
    if db is None:
        return
    
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
    
    # Upload collections
    upload_collection(db, 'disciplines', disciplines)
    upload_collection(db, 'locations', locations)
    upload_collection(db, 'universities', universities)
    
    print("✅ All filter collections uploaded!")

if __name__ == "__main__":
    main()