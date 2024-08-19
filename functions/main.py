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
def increment_course_disciplines_counter_on_create(
    event: Event[DocumentSnapshot],
) -> None:
    course = event.data.to_dict()
    discipline = course["discipline"]

    discipline_ref = db.collection("disciplines").document(discipline)

    try:
        discipline_ref.get().exists
        discipline_ref.update({"coursesCounter": firestore.Increment(1)})
    except NotFound:
        print(f"Discipline document '{discipline}' not found, creating it.")
        discipline_ref.set({"coursesCounter": 1})


@on_document_updated(document="courses/{courseId}")
def update_course_disciplines_counter_on_update(
    event: Event[Change[DocumentSnapshot]],
) -> None:

    before_discipline = event.data.before.get("discipline")
    after_discipline = event.data.after.get("discipline")

    # Only update the counters if the discipline has changed
    if before_discipline != after_discipline:
        # Decrement counter of the old discipline
        if before_discipline:
            db.collection("disciplines").document(before_discipline).update(
                {"coursesCounter": firestore.Increment(-1)}
            )
        # Increment counter of the new discipline
        if after_discipline:
            db.collection("disciplines").document(after_discipline).update(
                {"coursesCounter": firestore.Increment(1)}
            )


@on_document_deleted(document="courses/{courseId}")
def decrease_course_disciplines_counter_on_delete(
    event: Event[DocumentSnapshot],
) -> None:
    course = event.data.to_dict()
    discipline = course["discipline"]
    print(discipline)

    db.collection("disciplines").document(discipline).update(
        {"coursesCounter": firestore.Increment(-1)}
    )
