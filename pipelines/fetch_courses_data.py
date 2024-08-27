"""Script to (optionally) fetch course data from an API, process it, and save it as a JSON file."""

import requests
import time
import json
from tqdm import tqdm
from pipelines.gpt_classify_courses import classify_course_discipline
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


def create_discipline_id(discipline_name: str) -> str:
    discipline_name = discipline_name.lower()
    discipline_name = unidecode(discipline_name)
    discipline_name = re.sub(r"\s+", "_", discipline_name)
    discipline_name = re.sub(r"[^a-z0-9_]", "", discipline_name)
    return discipline_name


def process_courses(courses):
    print("Processing courses...")
    for course in tqdm(courses):
        course["nomeCorso"] = capitalize_name(course["nomeCorso"])
        course["nomeStruttura"] = capitalize_name(course["nomeStruttura"])

        discipline_name = classify_course_discipline(
            course_name=course["nomeCorso"],
            course_materia=course["classe"]["descrizione"],
        )
        discipline_id = create_discipline_id(discipline_name)

        course["discipline"] = {
            "id": discipline_id,
            "name": discipline_name,
        }
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
