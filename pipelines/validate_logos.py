"""
Validate university logo files and report any issues.
Checks that logos exist for universities and verifies file integrity.
"""

import json
import argparse
from pathlib import Path
from PIL import Image
import logging
from typing import Dict, List, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_course_data(input_file: Path) -> List[Dict]:
    """Load processed course data."""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get('courses', [])

def load_aliases(aliases_file: Path) -> Dict[str, str]:
    """Load university aliases."""
    if not aliases_file.exists():
        return {}
    
    try:
        with open(aliases_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logging.warning(f"Error loading aliases: {e}")
        return {}

def get_expected_logo_paths(uni_id: str, uni_name: str, aliases: Dict[str, str], logos_dir: Path) -> List[Path]:
    """Get all possible logo file paths for a university."""
    paths = []
    
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
        paths.extend([logos_dir / f for f in alias_files])
    
    # Check direct slug-based files
    slug_files = [
        f"{uni_id}_logo.png",
        f"{uni_id}_logo.jpg",
        f"{uni_id}_logo.svg",
        f"{uni_id}.png", 
        f"{uni_id}.jpg"
    ]
    paths.extend([logos_dir / f for f in slug_files])
    
    return paths

def validate_logo_file(logo_path: Path) -> Tuple[bool, str]:
    """Validate a logo file's integrity and properties."""
    if not logo_path.exists():
        return False, "File does not exist"
    
    try:
        with Image.open(logo_path) as img:
            # Check basic properties
            if img.width < 32 or img.height < 32:
                return False, f"Image too small: {img.width}x{img.height}"
            
            if img.width > 2000 or img.height > 2000:
                return False, f"Image too large: {img.width}x{img.height}"
            
            # Check file size
            file_size = logo_path.stat().st_size
            if file_size > 500_000:  # 500KB
                return False, f"File too large: {file_size:,} bytes"
            
            if file_size < 1000:  # 1KB
                return False, f"File too small: {file_size:,} bytes"
            
            return True, f"Valid - {img.width}x{img.height}, {file_size:,} bytes"
            
    except Exception as e:
        return False, f"Invalid image: {e}"

def validate_universities(courses: List[Dict], aliases: Dict[str, str], logos_dir: Path) -> Dict:
    """Validate logo coverage for all universities."""
    # Extract unique universities
    universities = {}
    for course in courses:
        university = course.get('university', {})
        uni_id = university.get('id')
        uni_name = university.get('name')
        
        if uni_id and uni_name:
            if uni_id not in universities:
                universities[uni_id] = {
                    'id': uni_id,
                    'name': uni_name,
                    'courses_count': 0
                }
            universities[uni_id]['courses_count'] += 1
    
    # Validate each university
    results = {
        'total_universities': len(universities),
        'universities_with_logos': 0,
        'universities_without_logos': 0,
        'invalid_logos': 0,
        'missing_details': [],
        'invalid_details': [],
        'valid_logos': []
    }
    
    for uni_data in universities.values():
        uni_id = uni_data['id']
        uni_name = uni_data['name']
        courses_count = uni_data['courses_count']
        
        # Get possible logo paths
        possible_paths = get_expected_logo_paths(uni_id, uni_name, aliases, logos_dir)
        
        # Find existing logo
        found_logo = None
        for path in possible_paths:
            if path.exists():
                found_logo = path
                break
        
        if found_logo:
            # Validate the logo
            is_valid, message = validate_logo_file(found_logo)
            
            if is_valid:
                results['universities_with_logos'] += 1
                results['valid_logos'].append({
                    'university_id': uni_id,
                    'university_name': uni_name,
                    'logo_file': found_logo.name,
                    'validation_message': message,
                    'courses_count': courses_count
                })
            else:
                results['invalid_logos'] += 1
                results['invalid_details'].append({
                    'university_id': uni_id,
                    'university_name': uni_name,
                    'logo_file': found_logo.name,
                    'error': message,
                    'courses_count': courses_count
                })
        else:
            results['universities_without_logos'] += 1
            if courses_count >= 2:  # Only report missing for universities with multiple courses
                results['missing_details'].append({
                    'university_id': uni_id,
                    'university_name': uni_name,
                    'courses_count': courses_count,
                    'expected_files': [p.name for p in possible_paths[:3]]  # Show first 3 expected names
                })
    
    return results

def generate_report(results: Dict, output_file: Path):
    """Generate validation report."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

def main():
    parser = argparse.ArgumentParser(
        description='Validate university logo files'
    )
    
    parser.add_argument(
        '--courses',
        type=Path,
        default='pipelines/data/all_courses_data.json',
        help='Processed course data file'
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
        help='Directory containing logo files'
    )
    
    parser.add_argument(
        '--output',
        type=Path,
        default='pipelines/data/validation_report.json',
        help='Output validation report file'
    )
    
    parser.add_argument(
        '--sample',
        type=int,
        help='Validate only a sample of N universities (for testing)'
    )
    
    args = parser.parse_args()
    
    # Validation
    if not args.courses.exists():
        logging.error(f"Course data file not found: {args.courses}")
        return 1
    
    if not args.logos_dir.exists():
        logging.error(f"Logos directory not found: {args.logos_dir}")
        return 1
    
    # Create output directory
    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # Load data
    logging.info(f"Loading course data from {args.courses}")
    courses = load_course_data(args.courses)
    
    if args.sample:
        courses = courses[:args.sample * 10]  # Rough sampling
        logging.info(f"Using sample of {len(courses)} courses")
    
    aliases = load_aliases(args.aliases)
    logging.info(f"Loaded {len(aliases)} aliases")
    
    # Validate
    logging.info("Validating university logos...")
    results = validate_universities(courses, aliases, args.logos_dir)
    
    # Generate report
    generate_report(results, args.output)
    
    # Summary
    total = results['total_universities']
    with_logos = results['universities_with_logos']
    without_logos = results['universities_without_logos']
    invalid_logos = results['invalid_logos']
    
    logging.info("=" * 60)
    logging.info("LOGO VALIDATION COMPLETE")
    logging.info(f"Total universities: {total}")
    logging.info(f"Universities with valid logos: {with_logos}")
    logging.info(f"Universities with invalid logos: {invalid_logos}")
    logging.info(f"Universities without logos: {without_logos}")
    
    if total > 0:
        coverage = (with_logos / total) * 100
        logging.info(f"Valid logo coverage: {coverage:.1f}%")
    
    if results['missing_details']:
        logging.info(f"\nTop missing logos (by course count):")
        sorted_missing = sorted(results['missing_details'], key=lambda x: -x['courses_count'])
        for missing in sorted_missing[:5]:
            logging.info(f"  - {missing['university_name']} ({missing['courses_count']} courses)")
    
    if results['invalid_details']:
        logging.info(f"\nInvalid logos found:")
        for invalid in results['invalid_details']:
            logging.info(f"  - {invalid['university_name']}: {invalid['error']}")
    
    logging.info(f"\nDetailed report saved to: {args.output}")
    logging.info("=" * 60)
    
    return 0

if __name__ == "__main__":
    exit(main())