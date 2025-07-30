from fuzzywuzzy import process
import firebase_admin
from firebase_admin import credentials, firestore, storage
from firebase_functions import https_fn
from firebase_functions.firestore_fn import (
    on_document_created,
    on_document_updated,
    on_document_deleted,
    Event,
    Change,
    DocumentSnapshot,
)
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


@https_fn.on_request()
@cross_origin(origins=["http://localhost:3000"], methods=["GET", "OPTIONS"])
def search_courses(request: https_fn.Request) -> https_fn.Response:
    all_courses = load_courses_from_storage()
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


@on_document_created(document="courses/{courseId}")
def increment_course_counters_on_create(event: Event[DocumentSnapshot]) -> None:
    course = event.data.to_dict()
    if not course:
        print("Warning: Empty course document created")
        return

    # List of fields to update counters for
    fields = [
        "discipline",
        "university",
        "location",
        "degree_type",
        "program_type",
        "language",
    ]

    for field in fields:
        field_data = course.get(field)
        if field_data and isinstance(field_data, dict) and field_data.get("id") and field_data.get("name"):
            collection_name = field + "s"  # e.g., 'disciplines', 'universities', etc.
            field_ref = db.collection(collection_name).document(field_data["id"])
            
            @firestore.transactional
            def update_counter_transaction(transaction):
                doc_snapshot = field_ref.get(transaction=transaction)
                if doc_snapshot.exists:
                    current_count = doc_snapshot.get("coursesCounter") or 0
                    transaction.update(field_ref, {"coursesCounter": current_count + 1})
                else:
                    # Document does not exist, create it
                    transaction.set(field_ref, {"name": field_data["name"], "coursesCounter": 1})
            
            try:
                db.run_transaction(update_counter_transaction)
            except Exception as e:
                print(f"Error updating {field} counter for {field_data['name']}: {e}")
        elif field_data:
            print(f"Warning: Invalid {field} data structure in course document: {field_data}")


@on_document_updated(document="courses/{courseId}")
def update_course_counters_on_update(event: Event[Change[DocumentSnapshot]]) -> None:
    before_course = event.data.before.to_dict() if event.data.before else {}
    after_course = event.data.after.to_dict() if event.data.after else {}

    fields = [
        "discipline",
        "university",
        "location",
        "degree_type",
        "program_type",
        "language",
    ]

    for field in fields:
        before_field = before_course.get(field)
        after_field = after_course.get(field)

        # Only update the counters if the field has changed
        if before_field != after_field:
            collection_name = field + "s"

            # Handle counter updates in a single transaction when possible
            if (before_field and isinstance(before_field, dict) and before_field.get("id") and 
                after_field and isinstance(after_field, dict) and after_field.get("id")):
                
                # Both fields exist - update both in transaction
                before_ref = db.collection(collection_name).document(before_field["id"])
                after_ref = db.collection(collection_name).document(after_field["id"])
                
                @firestore.transactional
                def update_both_counters_transaction(transaction):
                    # Decrement old counter
                    before_doc = before_ref.get(transaction=transaction)
                    if before_doc.exists:
                        before_count = before_doc.get("coursesCounter") or 0
                        new_count = max(0, before_count - 1)  # Prevent negative counts
                        transaction.update(before_ref, {"coursesCounter": new_count})
                    
                    # Increment new counter
                    after_doc = after_ref.get(transaction=transaction)
                    if after_doc.exists:
                        after_count = after_doc.get("coursesCounter") or 0
                        transaction.update(after_ref, {"coursesCounter": after_count + 1})
                    else:
                        transaction.set(after_ref, {"name": after_field["name"], "coursesCounter": 1})
                
                try:
                    db.run_transaction(update_both_counters_transaction)
                except Exception as e:
                    print(f"Error updating {field} counters in transaction: {e}")
            
            else:
                # Handle single field updates
                if before_field and isinstance(before_field, dict) and before_field.get("id"):
                    field_ref = db.collection(collection_name).document(before_field["id"])
                    try:
                        @firestore.transactional
                        def decrement_transaction(transaction):
                            doc = field_ref.get(transaction=transaction)
                            if doc.exists:
                                current_count = doc.get("coursesCounter") or 0
                                new_count = max(0, current_count - 1)
                                transaction.update(field_ref, {"coursesCounter": new_count})
                        
                        db.run_transaction(decrement_transaction)
                    except Exception as e:
                        print(f"Error decrementing {field} counter: {e}")

                if after_field and isinstance(after_field, dict) and after_field.get("id") and after_field.get("name"):
                    field_ref = db.collection(collection_name).document(after_field["id"])
                    try:
                        @firestore.transactional
                        def increment_transaction(transaction):
                            doc = field_ref.get(transaction=transaction)
                            if doc.exists:
                                current_count = doc.get("coursesCounter") or 0
                                transaction.update(field_ref, {"coursesCounter": current_count + 1})
                            else:
                                transaction.set(field_ref, {"name": after_field["name"], "coursesCounter": 1})
                        
                        db.run_transaction(increment_transaction)
                    except Exception as e:
                        print(f"Error incrementing {field} counter: {e}")


@on_document_deleted(document="courses/{courseId}")
def decrement_course_counters_on_delete(event: Event[DocumentSnapshot]) -> None:
    course = event.data.to_dict()
    if not course:
        print("Warning: Empty course document deleted")
        return

    fields = [
        "discipline",
        "university",
        "location",
        "degree_type",
        "program_type",
        "language",
    ]

    for field in fields:
        field_data = course.get(field)
        if field_data and isinstance(field_data, dict) and field_data.get("id"):
            collection_name = field + "s"
            field_ref = db.collection(collection_name).document(field_data["id"])
            
            @firestore.transactional
            def decrement_counter_transaction(transaction):
                doc_snapshot = field_ref.get(transaction=transaction)
                if doc_snapshot.exists:
                    current_count = doc_snapshot.get("coursesCounter") or 0
                    new_count = max(0, current_count - 1)  # Prevent negative counts
                    transaction.update(field_ref, {"coursesCounter": new_count})
                else:
                    print(f"Warning: {field} document {field_data['id']} not found during delete")
            
            try:
                db.run_transaction(decrement_counter_transaction)
            except Exception as e:
                print(f"Error decrementing {field} counter for {field_data.get('name', 'unknown')}: {e}")
        elif field_data:
            print(f"Warning: Invalid {field} data structure in deleted course document: {field_data}")
