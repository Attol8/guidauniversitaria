"""Script to fetch course data from Universitaly API, process it, and save it as JSON files."""

import requests
import time
import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from tqdm import tqdm
from gpt_classify_courses import classify_course_discipline
from unidecode import unidecode
import re
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pipelines/logs/fetch_courses.log'),
        logging.StreamHandler()
    ]
)


def save_courses_to_json(courses, output_path):
    with open(output_path, "w") as f:
        json.dump({"courses": courses}, f)
        print(f"Courses Data has been saved to {output_path}.")


def load_courses_from_json(input_path):
    with open(input_path) as f:
        return json.load(f)["courses"]


def fetch_all_courses(base_url: str, env: str = "production", initial_page: int = 1, sleep_time: float = 1, max_retries: int = 3) -> List[Dict[Any, Any]]:
    """Fetch all courses from Universitaly API with retry logic."""
    courses = []
    page = initial_page
    
    # Get total pages
    try:
        logging.info(f"Fetching initial data from page {page}")
        initial_response = make_request_with_retry(f"{base_url}?page={page}", max_retries)
        
        if env == "development":
            total_pages = 2
            logging.info(f"Development mode: limiting to {total_pages} pages")
        else:
            total_pages = initial_response.json()["universita"]["totalPages"]
            logging.info(f"Production mode: fetching {total_pages} total pages")
            
    except Exception as e:
        logging.error(f"Failed to get initial data: {e}")
        return courses

    # Fetch all pages
    failed_pages = []
    for page in tqdm(range(initial_page, total_pages + 1), desc="Fetching pages"):
        try:
            url = f"{base_url}?page={page}"
            response = make_request_with_retry(url, max_retries)
            
            data = response.json()
            page_courses = data.get("universita", {}).get("corsi", [])
            courses.extend(page_courses)
            
            logging.debug(f"Page {page}: fetched {len(page_courses)} courses")
            time.sleep(sleep_time)
            
        except Exception as e:
            logging.warning(f"Failed to fetch page {page}: {e}")
            failed_pages.append(page)
            continue

    if failed_pages:
        logging.warning(f"Failed to fetch {len(failed_pages)} pages: {failed_pages}")
    
    logging.info(f"Successfully fetched {len(courses)} courses from {total_pages - len(failed_pages)} pages")
    return courses


def make_request_with_retry(url: str, max_retries: int = 3, backoff_factor: float = 1.0) -> requests.Response:
    """Make HTTP request with exponential backoff retry logic."""
    for attempt in range(max_retries + 1):
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                return response
            elif response.status_code == 429:  # Rate limited
                wait_time = backoff_factor * (2 ** attempt)
                logging.warning(f"Rate limited on attempt {attempt + 1}, waiting {wait_time}s")
                time.sleep(wait_time)
            else:
                response.raise_for_status()
        except requests.exceptions.RequestException as e:
            if attempt == max_retries:
                raise e
            wait_time = backoff_factor * (2 ** attempt)
            logging.warning(f"Request failed on attempt {attempt + 1}: {e}, retrying in {wait_time}s")
            time.sleep(wait_time)
    
    raise Exception(f"Max retries ({max_retries}) exceeded for URL: {url}")


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


def process_courses(courses: List[Dict[Any, Any]], enable_classification: bool = True) -> List[Dict[Any, Any]]:
    """Process raw course data with optional AI classification."""
    logging.info(f"Processing {len(courses)} courses...")
    
    processed_courses = []
    classification_cache = {}
    
    for course in tqdm(courses):
        try:
            # Capitalize names
            course["nomeCorso"] = capitalize_name(course.get("nomeCorso", ""))
            course["nomeStruttura"] = capitalize_name(course.get("nomeStruttura", ""))

            # Map language codes to full names
            course["lingua"] = {"IT": "Italiano", "EN": "Inglese", "mu": "Multilingua"}.get(
                course.get("lingua", "IT"), course.get("lingua", "IT")
            )

            # Process Discipline
            if enable_classification:
                # Use cache for classification to avoid redundant API calls
                cache_key = f"{course['nomeCorso']}_{course.get('classe', {}).get('descrizione', '')}"
                if cache_key in classification_cache:
                    discipline_name = classification_cache[cache_key]
                else:
                    discipline_name = classify_course_discipline(
                        course_name=course["nomeCorso"],
                        course_materia=course.get("classe", {}).get("descrizione", ""),
                    )
                    classification_cache[cache_key] = discipline_name
            else:
                # Use the existing class description as discipline
                discipline_name = course.get("classe", {}).get("descrizione", "Generale")
            
            discipline_id = create_id_from_name(discipline_name)
            course["discipline"] = {
                "id": discipline_id,
                "name": discipline_name,
            }

            # Process University
            university_name = course.get("nomeStruttura", "Unknown University")
            university_id = create_id_from_name(university_name)
            course["university"] = {
                "id": university_id,
                "name": university_name,
            }

            # Process Location
            sede = course.get("sede")
            if sede and sede.get("comuneDescrizione"):
                location_name = sede.get("comuneDescrizione").lower().capitalize()
                location_id = create_id_from_name(location_name)
                course["location"] = {
                    "id": location_id,
                    "name": location_name,
                }
            else:
                # Fallback to extracting from university name or set to N/A
                university_name = course.get("nomeStruttura", "")
                if "TORINO" in university_name.upper():
                    location_name = "Torino"
                elif "UDINE" in university_name.upper():
                    location_name = "Udine"
                elif "TRIESTE" in university_name.upper():
                    location_name = "Trieste"
                else:
                    location_name = "N/A"
                
                location_id = create_id_from_name(location_name) if location_name != "N/A" else None
                course["location"] = {
                    "id": location_id,
                    "name": location_name,
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
            language_name = course.get("lingua", "Italiano")
            language_id = create_id_from_name(language_name)
            course["language"] = {
                "id": language_id,
                "name": language_name,
            }

            processed_courses.append(course)
            
        except Exception as e:
            logging.warning(f"Error processing course {course.get('nomeCorso', 'Unknown')}: {e}")
            continue

    logging.info(f"Successfully processed {len(processed_courses)}/{len(courses)} courses")
    if enable_classification:
        logging.info(f"Used {len(classification_cache)} unique classifications")
    
    return processed_courses


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Fetch and process Italian university course data from Universitaly"
    )
    
    parser.add_argument(
        "--env", 
        choices=["development", "production"],
        default="production",
        help="Environment mode (default: production)"
    )
    
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="Fetch fresh data from API (default: use cached data)"
    )
    
    parser.add_argument(
        "--classify",
        action="store_true", 
        default=False,
        help="Enable AI classification of courses (uses OpenAI API)"
    )
    
    parser.add_argument(
        "--sleep",
        type=float,
        default=1.0,
        help="Sleep time between API requests in seconds (default: 1.0)"
    )
    
    parser.add_argument(
        "--start-page",
        type=int,
        default=1,
        help="Starting page number for API fetch (default: 1)"
    )
    
    parser.add_argument(
        "--max-retries",
        type=int,
        default=3,
        help="Maximum retries for failed requests (default: 3)"
    )

    return parser.parse_args()


def main():
    """Main execution function."""
    args = parse_args()
    
    # Setup paths
    data_dir = Path("pipelines/data")
    data_dir.mkdir(exist_ok=True)
    
    base_url = "https://universitaly-backend.cineca.it/api/offerta-formativa/cerca-corsi"
    
    if args.env == "development":
        raw_file = data_dir / "raw_test_courses_data.json"
        processed_file = data_dir / "test_courses_data.json"
    else:
        raw_file = data_dir / "raw_all_courses_data.json"  
        processed_file = data_dir / "all_courses_data.json"
    
    # Fetch or load course data
    if args.fetch:
        logging.info(f"Fetching fresh data in {args.env} mode...")
        courses = fetch_all_courses(
            base_url=base_url,
            env=args.env,
            initial_page=args.start_page,
            sleep_time=args.sleep,
            max_retries=args.max_retries
        )
        
        if not courses:
            logging.error("No courses fetched, aborting")
            sys.exit(1)
            
        save_courses_to_json(courses, raw_file)
        logging.info(f"Saved {len(courses)} raw courses to {raw_file}")
    else:
        if not raw_file.exists():
            logging.error(f"Raw data file {raw_file} not found. Use --fetch to download data first.")
            sys.exit(1)
            
        logging.info(f"Loading existing data from {raw_file}")
        courses = load_courses_from_json(raw_file)

    # Process courses
    logging.info("Starting course processing...")
    processed_courses = process_courses(courses, enable_classification=args.classify)
    
    if not processed_courses:
        logging.error("No courses processed successfully, aborting")
        sys.exit(1)
    
    # Save processed data
    save_courses_to_json(processed_courses, processed_file)
    logging.info(f"Saved {len(processed_courses)} processed courses to {processed_file}")
    
    # Summary
    logging.info("=" * 50)
    logging.info("PROCESSING COMPLETE")
    logging.info(f"Environment: {args.env}")
    logging.info(f"Total courses: {len(processed_courses)}")
    logging.info(f"AI Classification: {'Enabled' if args.classify else 'Disabled'}")
    logging.info(f"Output file: {processed_file}")
    logging.info("=" * 50)


if __name__ == "__main__":
    main()
