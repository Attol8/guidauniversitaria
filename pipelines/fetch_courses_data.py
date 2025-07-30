"""Script to (optionally) fetch course data from an API, process it, and save it as a JSON file."""

import requests
import time
import json
from tqdm import tqdm
from gpt_classify_courses import classify_course_discipline
from unidecode import unidecode
import re

ENV = "development"
FETCH_DATA = False


def save_courses_to_json(courses, output_path):
    with open(output_path, "w") as f:
        json.dump({"courses": courses}, f)
        print(f"Courses Data has been saved to {output_path}.")


def load_courses_from_json(input_path):
    with open(input_path) as f:
        return json.load(f)["courses"]


def fetch_all_courses(base_url, initial_page=1, sleep_time=1):
    courses = []
    page = initial_page

    initial_response = requests.get(f"{base_url}?page={page}")
    if initial_response.status_code != 200:
        print(f"Failed to fetch initial data: HTTP {initial_response.status_code}")
        return courses
    if ENV == "development":
        total_pages = 2
    else:
        total_pages = initial_response.json()["universita"]["totalPages"]

    for page in tqdm(range(initial_page, total_pages + 1), desc="Fetching pages"):
        url = f"{base_url}?page={page}"
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to fetch data on page {page}: HTTP {response.status_code}")
            break

        data = response.json()
        courses.extend(data["universita"]["corsi"])
        time.sleep(sleep_time)

    return courses


def capitalize_name(name):
    # Lowercase words that should not be capitalized
    lowercase_words = {
        "della",
        "di",
        "e",
        "con",
        "per",
        "dell",
        "degli",
        "del",
        "a",
        "da",
        "in",
        "su",
        "per",
        "tra",
        "fra",
    }
    words = name.split()
    capitalized_words = [words[0].capitalize()] + [
        word.capitalize() if word.lower() not in lowercase_words else word.lower()
        for word in words[1:]
    ]
    return " ".join(capitalized_words)


def create_id_from_name(name: str) -> str:
    name = name.lower()
    name = unidecode(name)
    name = re.sub(r"\s+", "_", name)
    name = re.sub(r"[^a-z0-9_]", "", name)
    return name


def process_courses(courses):
    print("Processing courses...")
    for course in tqdm(courses):
        # Capitalize names
        course["nomeCorso"] = capitalize_name(course["nomeCorso"])
        course["nomeStruttura"] = capitalize_name(course["nomeStruttura"])

        # Map language codes to full names
        course["lingua"] = {"IT": "Italiano", "EN": "Inglese", "mu": "Multilingua"}.get(
            course["lingua"], course["lingua"]
        )

        # Process Discipline
        discipline_name = classify_course_discipline(
            course_name=course["nomeCorso"],
            course_materia=course["classe"]["descrizione"],
        )
        discipline_id = create_id_from_name(discipline_name)
        course["discipline"] = {
            "id": discipline_id,
            "name": discipline_name,
        }

        # Process University
        university_name = course["nomeStruttura"]
        university_id = create_id_from_name(university_name)
        course["university"] = {
            "id": university_id,
            "name": university_name,
        }

        # Process Location
        location_name = (
            course.get("sede", {}).get("comuneDescrizione").lower().capitalize()
        )
        if location_name:
            location_id = create_id_from_name(location_name)
            course["location"] = {
                "id": location_id,
                "name": location_name,
            }
        else:
            course["location"] = {
                "id": None,
                "name": "N/A",
            }

        # Process Degree Type
        degree_type_name = course.get("tipoLaurea", {}).get("descrizione")
        if degree_type_name:
            degree_type_id = create_id_from_name(degree_type_name)
            course["degree_type"] = {
                "id": degree_type_id,
                "name": degree_type_name,
            }
        else:
            course["degree_type"] = {
                "id": None,
                "name": "N/A",
            }

        # Process Program Type (Entrance)
        program_type_name = course.get("programmazione", {}).get("descrizione")
        if program_type_name:
            program_type_id = create_id_from_name(program_type_name)
            course["program_type"] = {
                "id": program_type_id,
                "name": program_type_name,
            }
        else:
            course["program_type"] = {
                "id": None,
                "name": "N/A",
            }

        # Process Language
        language_name = course["lingua"]
        language_id = create_id_from_name(language_name)
        course["language"] = {
            "id": language_id,
            "name": language_name,
        }

        # Optionally remove old keys if they are no longer needed
        # del course["nomeStruttura"]
        # del course["sede"]
        # del course["tipoLaurea"]
        # del course["programmazione"]
        # del course["lingua"]

    return courses


if __name__ == "__main__":
    base_url = (
        "https://universitaly-backend.cineca.it/api/offerta-formativa/cerca-corsi"
    )

    if ENV == "development":
        if FETCH_DATA:
            courses = fetch_all_courses(base_url)
            save_courses_to_json(courses, "pipelines/data/raw_test_courses_data.json")

        else:
            courses = load_courses_from_json(
                "pipelines/data/raw_test_courses_data.json"
            )

        courses = process_courses(courses)
        save_courses_to_json(courses, "pipelines/data/test_courses_data.json")

    else:
        if FETCH_DATA:
            courses = fetch_all_courses(base_url)
            save_courses_to_json(courses, "pipelines/data/raw_all_courses_data.json")

        else:
            courses = load_courses_from_json("pipelines/data/raw_all_courses_data.json")

        courses = process_courses(courses)
        save_courses_to_json(courses, "pipelines/data/all_courses_data.json")
