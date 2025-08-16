"""
Extract canonical university list from processed course data.
Creates CSV with columns: slug, name, courses_count, logo_needed
"""

import json
import csv
import argparse
from pathlib import Path
from collections import defaultdict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_course_data(input_file: Path) -> list:
    """Load processed course data from JSON file."""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get('courses', [])

def extract_universities(courses: list) -> dict:
    """Extract unique universities with metadata."""
    universities = {}
    
    for course in courses:
        university = course.get('university', {})
        uni_id = university.get('id')
        uni_name = university.get('name')
        
        if not uni_id or not uni_name:
            continue
            
        if uni_id not in universities:
            universities[uni_id] = {
                'id': uni_id,
                'name': uni_name,
                'courses_count': 0,
                'course_examples': []
            }
        
        universities[uni_id]['courses_count'] += 1
        
        # Keep first 3 course examples for reference
        if len(universities[uni_id]['course_examples']) < 3:
            universities[uni_id]['course_examples'].append(course.get('nomeCorso', ''))
    
    return universities

def check_existing_logos(uni_id: str, aliases: dict, logos_dir: Path) -> bool:
    """Check if a university already has a logo file."""
    # Check alias mapping first
    if uni_id in aliases:
        alias_code = aliases[uni_id]
        alias_files = [
            f"{alias_code}_logo.png",
            f"{alias_code}_logo.jpg", 
            f"{alias_code}_logo.svg",
            f"{alias_code}.png",
            f"{alias_code}.jpg"
        ]
        for alias_file in alias_files:
            if (logos_dir / alias_file).exists():
                return True
    
    # Check direct slug-based files
    slug_files = [
        f"{uni_id}_logo.png",
        f"{uni_id}_logo.jpg",
        f"{uni_id}_logo.svg",
        f"{uni_id}.png", 
        f"{uni_id}.jpg"
    ]
    for slug_file in slug_files:
        if (logos_dir / slug_file).exists():
            return True
    
    return False

def save_universities_csv(universities: dict, output_file: Path, aliases: dict, logos_dir: Path):
    """Save universities to CSV file."""
    fieldnames = ['id', 'name', 'courses_count', 'has_logo', 'course_examples']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        # Sort by courses count descending, then alphabetically
        sorted_unis = sorted(
            universities.values(),
            key=lambda x: (-x['courses_count'], x['name'])
        )
        
        for uni in sorted_unis:
            has_logo = check_existing_logos(uni['id'], aliases, logos_dir)
            
            writer.writerow({
                'id': uni['id'],
                'name': uni['name'], 
                'courses_count': uni['courses_count'],
                'has_logo': has_logo,
                'course_examples': ' | '.join(uni['course_examples'][:3])
            })

def load_aliases(aliases_file: Path) -> dict:
    """Load university ID to code aliases mapping."""
    if not aliases_file.exists():
        logging.warning(f"Aliases file not found: {aliases_file}")
        return {}
        
    try:
        with open(aliases_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logging.warning(f"Error loading aliases: {e}")
        return {}

def main():
    parser = argparse.ArgumentParser(
        description='Extract canonical university list from course data'
    )
    
    parser.add_argument(
        '--input',
        type=Path,
        default='pipelines/data/all_courses_data.json',
        help='Input processed course data JSON file'
    )
    
    parser.add_argument(
        '--output',
        type=Path, 
        default='pipelines/data/universities.csv',
        help='Output CSV file path'
    )
    
    parser.add_argument(
        '--aliases',
        type=Path,
        default='public/images/uni_images/uni_logos/aliases.json',
        help='University aliases JSON file'
    )
    
    parser.add_argument(
        '--logos-dir',
        type=Path,
        default='public/images/uni_images/uni_logos',
        help='Directory containing existing logo files'
    )
    
    args = parser.parse_args()
    
    # Validation
    if not args.input.exists():
        logging.error(f"Input file not found: {args.input}")
        return 1
    
    # Create output directory
    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # Load data
    logging.info(f"Loading course data from {args.input}")
    courses = load_course_data(args.input)
    
    if not courses:
        logging.error("No courses found in input file")
        return 1
    
    # Extract universities
    logging.info(f"Extracting universities from {len(courses)} courses")
    universities = extract_universities(courses)
    
    logging.info(f"Found {len(universities)} unique universities")
    
    # Load aliases
    aliases = load_aliases(args.aliases)
    logging.info(f"Loaded {len(aliases)} university aliases")
    
    # Save CSV
    save_universities_csv(universities, args.output, aliases, args.logos_dir)
    logging.info(f"Saved university list to {args.output}")
    
    # Summary stats
    total_unis = len(universities)
    unis_with_logos = sum(
        1 for uni in universities.values() 
        if check_existing_logos(uni['id'], aliases, args.logos_dir)
    )
    unis_missing_logos = total_unis - unis_with_logos
    
    logging.info("=" * 50)
    logging.info("UNIVERSITY EXTRACTION COMPLETE")
    logging.info(f"Total universities: {total_unis}")
    logging.info(f"Universities with logos: {unis_with_logos}")
    logging.info(f"Universities missing logos: {unis_missing_logos}")
    logging.info(f"Coverage: {unis_with_logos/total_unis*100:.1f}%")
    logging.info("=" * 50)
    
    return 0

if __name__ == "__main__":
    exit(main())