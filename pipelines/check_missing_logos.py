"""
Check which universities are missing logo files and generate a detailed missing list.
Outputs JSON file with universities that need logos downloaded.
"""

import json
import csv
import argparse
from pathlib import Path
import logging
from urllib.parse import urlparse
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_universities_csv(csv_file: Path) -> list:
    """Load universities from CSV file."""
    universities = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row['courses_count'] = int(row['courses_count'])
            row['has_logo'] = row['has_logo'].lower() == 'true'
            universities.append(row)
    return universities

def load_aliases(aliases_file: Path) -> dict:
    """Load existing aliases mapping."""
    if not aliases_file.exists():
        return {}
    
    try:
        with open(aliases_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logging.warning(f"Error loading aliases: {e}")
        return {}

def extract_domain_from_university(university_name: str) -> str:
    """Attempt to extract/guess domain from university name."""
    name = university_name.lower()
    
    # Common domain patterns for Italian universities
    domain_patterns = {
        # Major universities with known domains
        'università degli studi di bologna': 'unibo.it',
        'università degli studi di milano': 'unimi.it', 
        'università degli studi di roma la sapienza': 'uniroma1.it',
        'università degli studi di napoli federico ii': 'unina.it',
        'università degli studi di padova': 'unipd.it',
        'università degli studi di torino': 'unito.it',
        'università degli studi di firenze': 'unifi.it',
        'università degli studi di pisa': 'unipi.it',
        'università degli studi di genova': 'unige.it',
        'università degli studi di perugia': 'unipg.it',
        'università commerciale luigi bocconi': 'unibocconi.it',
        'libera università di bolzano': 'unibz.it',
        'università cattolica del sacro cuore': 'unicatt.it',
    }
    
    # Check exact matches first
    if name in domain_patterns:
        return domain_patterns[name]
    
    # Try to construct domain from name
    # Remove common words and extract key parts
    clean_name = re.sub(r'università\s+(degli\s+studi\s+di\s+|telematica\s+|commerciale\s+|cattolica\s+|libera\s+)', '', name)
    clean_name = re.sub(r'\s+(di\s+|del\s+|della\s+|degli\s+|delle\s+)', '', clean_name)
    clean_name = re.sub(r'[^\w\s]', '', clean_name)
    
    # Take first significant word
    words = clean_name.split()
    if words:
        first_word = words[0]
        
        # Common patterns
        if len(first_word) > 3:
            if first_word in ['bologna', 'milano', 'roma', 'napoli', 'torino', 'firenze', 'genova']:
                return f"uni{first_word[:3]}.it"
            else:
                return f"uni{first_word}.it"
    
    return None

def get_expected_filename(university_id: str, aliases: dict) -> str:
    """Get expected logo filename for a university."""
    if university_id in aliases:
        return f"{aliases[university_id]}_logo.png"
    else:
        return f"{university_id}_logo.png"

def check_missing_logos(universities: list, aliases: dict, logos_dir: Path) -> list:
    """Generate list of universities missing logos."""
    missing = []
    
    for uni in universities:
        if uni['has_logo']:
            continue
            
        # Skip if very few courses (might be data quality issue)
        if uni['courses_count'] < 2:
            logging.debug(f"Skipping {uni['name']} - only {uni['courses_count']} course(s)")
            continue
        
        expected_filename = get_expected_filename(uni['id'], aliases)
        guessed_domain = extract_domain_from_university(uni['name'])
        
        missing_info = {
            'id': uni['id'],
            'name': uni['name'],
            'courses_count': uni['courses_count'],
            'expected_filename': expected_filename,
            'guessed_domain': guessed_domain,
            'course_examples': uni['course_examples'],
            'priority': 'high' if uni['courses_count'] >= 10 else 'medium' if uni['courses_count'] >= 5 else 'low'
        }
        
        missing.append(missing_info)
    
    # Sort by priority and courses count
    priority_order = {'high': 0, 'medium': 1, 'low': 2}
    missing.sort(key=lambda x: (priority_order[x['priority']], -x['courses_count'], x['name']))
    
    return missing

def save_missing_logos(missing_logos: list, output_file: Path):
    """Save missing logos list to JSON file."""
    output_data = {
        'generated_at': str(Path(__file__).stat().st_mtime),
        'total_missing': len(missing_logos),
        'high_priority': len([x for x in missing_logos if x['priority'] == 'high']),
        'medium_priority': len([x for x in missing_logos if x['priority'] == 'medium']),
        'low_priority': len([x for x in missing_logos if x['priority'] == 'low']),
        'missing_logos': missing_logos
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

def generate_manual_override_template(missing_logos: list, output_file: Path):
    """Generate CSV template for manual logo URL overrides."""
    if not missing_logos:
        return
        
    # Only include high priority ones in manual override template
    high_priority = [x for x in missing_logos if x['priority'] == 'high']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['university_id', 'university_name', 'logo_url', 'notes']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for uni in high_priority:
            writer.writerow({
                'university_id': uni['id'],
                'university_name': uni['name'],
                'logo_url': '',  # To be filled manually
                'notes': f"{uni['courses_count']} courses"
            })

def main():
    parser = argparse.ArgumentParser(
        description='Check which universities are missing logo files'
    )
    
    parser.add_argument(
        '--universities',
        type=Path,
        default='pipelines/data/universities.csv',
        help='Universities CSV file from list_universities.py'
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
    
    parser.add_argument(
        '--output',
        type=Path,
        default='pipelines/data/missing_logos.json',
        help='Output JSON file with missing logos list'
    )
    
    parser.add_argument(
        '--manual-template',
        type=Path,
        default='pipelines/data/manual_logo_overrides.csv',
        help='Generate CSV template for manual logo URL overrides'
    )
    
    args = parser.parse_args()
    
    # Validation
    if not args.universities.exists():
        logging.error(f"Universities file not found: {args.universities}")
        logging.info("Run list_universities.py first to generate this file")
        return 1
    
    # Create output directory
    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # Load data
    logging.info(f"Loading universities from {args.universities}")
    universities = load_universities_csv(args.universities)
    
    aliases = load_aliases(args.aliases)
    logging.info(f"Loaded {len(aliases)} aliases")
    
    # Check missing logos
    logging.info("Checking for missing logos...")
    missing_logos = check_missing_logos(universities, aliases, args.logos_dir)
    
    # Save results
    save_missing_logos(missing_logos, args.output)
    logging.info(f"Saved missing logos list to {args.output}")
    
    # Generate manual override template
    generate_manual_override_template(missing_logos, args.manual_template)
    logging.info(f"Generated manual override template: {args.manual_template}")
    
    # Summary
    total_unis = len(universities)
    missing_count = len(missing_logos)
    high_priority = len([x for x in missing_logos if x['priority'] == 'high'])
    medium_priority = len([x for x in missing_logos if x['priority'] == 'medium'])
    low_priority = len([x for x in missing_logos if x['priority'] == 'low'])
    
    logging.info("=" * 60)
    logging.info("MISSING LOGOS CHECK COMPLETE")
    logging.info(f"Total universities: {total_unis}")
    logging.info(f"Missing logos: {missing_count}")
    logging.info(f"  - High priority (10+ courses): {high_priority}")
    logging.info(f"  - Medium priority (5-9 courses): {medium_priority}") 
    logging.info(f"  - Low priority (2-4 courses): {low_priority}")
    
    if missing_count > 0:
        logging.info(f"Coverage: {(total_unis - missing_count)/total_unis*100:.1f}%")
        logging.info("Next steps:")
        logging.info(f"1. Run: python pipelines/download_university_logos.py")
        logging.info(f"2. Manually fill high-priority URLs in: {args.manual_template}")
    else:
        logging.info("All universities have logos! 🎉")
    logging.info("=" * 60)
    
    return 0

if __name__ == "__main__":
    exit(main())