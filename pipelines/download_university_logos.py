"""
Download university logos from multiple sources with fallback strategy.
Supports: Official websites, Clearbit API, Google Custom Search, Wikipedia/Wikimedia
"""

import json
import csv
import requests
import argparse
import time
import re
from pathlib import Path
from typing import Optional, List, Dict
from urllib.parse import urljoin, urlparse
import logging
from PIL import Image
import io
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class LogoScraper:
    def __init__(self, user_agent: str = None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': user_agent or 'Mozilla/5.0 (compatible; UniversityLogoBot/1.0; +https://guidauniversitaria.it/)'
        })
        
        # Load manual overrides if they exist
        self.manual_overrides = self.load_manual_overrides()
        
    def load_manual_overrides(self, overrides_file: Path = Path('pipelines/data/manual_logo_overrides.csv')) -> Dict[str, str]:
        """Load manual URL overrides from CSV."""
        overrides = {}
        if not overrides_file.exists():
            return overrides
            
        try:
            with open(overrides_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row['logo_url'].strip():
                        overrides[row['university_id']] = row['logo_url'].strip()
        except Exception as e:
            logging.warning(f"Error loading manual overrides: {e}")
            
        logging.info(f"Loaded {len(overrides)} manual URL overrides")
        return overrides
    
    def download_and_validate_logo(self, url: str) -> Optional[bytes]:
        """Download and validate logo image."""
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code != 200:
                return None
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not any(ct in content_type for ct in ['image/', 'application/octet-stream']):
                return None
            
            image_data = response.content
            
            # Validate it's actually an image
            try:
                with Image.open(io.BytesIO(image_data)) as img:
                    # Basic validation
                    if img.width < 32 or img.height < 32:
                        logging.debug(f"Image too small: {img.width}x{img.height}")
                        return None
                    if img.width > 2000 or img.height > 2000:
                        logging.debug(f"Image too large: {img.width}x{img.height}")
                        return None
                    
                    # Convert to PNG for consistency
                    output = io.BytesIO()
                    
                    # Handle transparency
                    if img.mode in ('RGBA', 'LA'):
                        # Keep transparency
                        img.save(output, format='PNG', optimize=True)
                    else:
                        # Convert to RGB then PNG
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        img.save(output, format='PNG', optimize=True)
                    
                    return output.getvalue()
                    
            except Exception as e:
                logging.debug(f"Image validation failed: {e}")
                return None
                
        except Exception as e:
            logging.debug(f"Download failed: {e}")
            return None
    
    def try_clearbit_logo(self, domain: str) -> Optional[str]:
        """Try to get logo from Clearbit Logo API."""
        if not domain:
            return None
            
        clearbit_url = f"https://logo.clearbit.com/{domain}?size=200"
        logging.debug(f"Trying Clearbit: {clearbit_url}")
        
        try:
            response = self.session.head(clearbit_url, timeout=5)
            if response.status_code == 200:
                return clearbit_url
        except:
            pass
        
        return None
    
    def try_official_website(self, domain: str, university_name: str) -> Optional[str]:
        """Try to scrape logo from official university website."""
        if not domain:
            return None
            
        try:
            # Try HTTPS first, then HTTP
            for protocol in ['https', 'http']:
                try:
                    url = f"{protocol}://{domain}"
                    logging.debug(f"Trying official website: {url}")
                    
                    response = self.session.get(url, timeout=10)
                    if response.status_code != 200:
                        continue
                    
                    html = response.text
                    
                    # Look for logo in common locations
                    logo_patterns = [
                        r'<img[^>]*src=["\']([^"\']*logo[^"\']*)["\'][^>]*>',
                        r'<img[^>]*src=["\']([^"\']*brand[^"\']*)["\'][^>]*>',
                        r'<img[^>]*class=["\'][^"\']*logo[^"\']*["\'][^>]*src=["\']([^"\']*)["\'][^>]*>',
                        r'<link[^>]*rel=["\']shortcut\s+icon["\'][^>]*href=["\']([^"\']*)["\'][^>]*>',
                        r'<link[^>]*rel=["\']apple-touch-icon["\'][^>]*href=["\']([^"\']*)["\'][^>]*>',
                    ]
                    
                    for pattern in logo_patterns:
                        matches = re.findall(pattern, html, re.IGNORECASE)
                        for match in matches:
                            # Convert relative URLs to absolute
                            if match.startswith('//'):
                                logo_url = f"{protocol}:{match}"
                            elif match.startswith('/'):
                                logo_url = urljoin(url, match)
                            elif not match.startswith('http'):
                                logo_url = urljoin(url, match)
                            else:
                                logo_url = match
                            
                            # Skip data URLs and tiny images
                            if logo_url.startswith('data:') or 'favicon' in logo_url.lower():
                                continue
                            
                            return logo_url
                    
                except requests.RequestException:
                    continue
                    
        except Exception as e:
            logging.debug(f"Official website scraping failed: {e}")
        
        return None
    
    def try_wikipedia_logo(self, university_name: str) -> Optional[str]:
        """Try to find logo on Wikipedia/Wikimedia."""
        try:
            # Search Wikipedia
            search_url = "https://it.wikipedia.org/api/rest_v1/page/summary/" + university_name.replace(' ', '_')
            
            response = self.session.get(search_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                thumbnail = data.get('thumbnail', {})
                if thumbnail.get('source'):
                    # Get higher resolution version
                    wiki_logo_url = thumbnail['source'].replace('/thumb/', '/').split('/')[:-1]
                    wiki_logo_url = '/'.join(wiki_logo_url)
                    return wiki_logo_url
                    
        except Exception as e:
            logging.debug(f"Wikipedia search failed: {e}")
        
        # Try Wikimedia Commons search
        try:
            search_query = f"{university_name} logo"
            commons_url = "https://commons.wikimedia.org/w/api.php"
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': search_query,
                'srnamespace': 6,  # File namespace
                'srlimit': 5
            }
            
            response = self.session.get(commons_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                search_results = data.get('query', {}).get('search', [])
                
                for result in search_results:
                    title = result['title']
                    if 'logo' in title.lower() and not 'seal' in title.lower():
                        # Get file info
                        file_params = {
                            'action': 'query',
                            'format': 'json',
                            'titles': title,
                            'prop': 'imageinfo',
                            'iiprop': 'url'
                        }
                        
                        file_response = self.session.get(commons_url, params=file_params, timeout=10)
                        if file_response.status_code == 200:
                            file_data = file_response.json()
                            pages = file_data.get('query', {}).get('pages', {})
                            for page in pages.values():
                                imageinfo = page.get('imageinfo', [])
                                if imageinfo:
                                    return imageinfo[0]['url']
                                    
        except Exception as e:
            logging.debug(f"Wikimedia Commons search failed: {e}")
        
        return None
    
    def try_google_search(self, university_name: str, google_api_key: str = None, google_cx: str = None) -> Optional[str]:
        """Try Google Custom Search API (requires API key)."""
        if not google_api_key or not google_cx:
            return None
            
        try:
            search_url = "https://www.googleapis.com/customsearch/v1"
            params = {
                'key': google_api_key,
                'cx': google_cx,
                'q': f'"{university_name}" logo filetype:png OR filetype:svg',
                'searchType': 'image',
                'num': 3
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                items = data.get('items', [])
                
                for item in items:
                    return item.get('link')
                    
        except Exception as e:
            logging.debug(f"Google search failed: {e}")
        
        return None
    
    def scrape_university_logo(self, university: Dict, google_api_key: str = None, google_cx: str = None) -> Optional[bytes]:
        """Try all sources to scrape a university logo."""
        uni_id = university['id']
        uni_name = university['name']
        domain = university.get('guessed_domain')
        
        logging.info(f"Scraping logo for: {uni_name}")
        
        # 1. Manual override (highest priority)
        if uni_id in self.manual_overrides:
            url = self.manual_overrides[uni_id]
            logging.info(f"  Using manual override: {url}")
            logo_data = self.download_and_validate_logo(url)
            if logo_data:
                return logo_data
            logging.warning(f"  Manual override failed: {url}")
        
        # 2. Official website scraping
        if domain:
            url = self.try_official_website(domain, uni_name)
            if url:
                logging.info(f"  Found on official website: {url}")
                logo_data = self.download_and_validate_logo(url)
                if logo_data:
                    return logo_data
        
        # 3. Clearbit Logo API
        if domain:
            url = self.try_clearbit_logo(domain)
            if url:
                logging.info(f"  Found on Clearbit: {url}")
                logo_data = self.download_and_validate_logo(url)
                if logo_data:
                    return logo_data
        
        # 4. Wikipedia/Wikimedia
        url = self.try_wikipedia_logo(uni_name)
        if url:
            logging.info(f"  Found on Wikipedia: {url}")
            logo_data = self.download_and_validate_logo(url)
            if logo_data:
                return logo_data
        
        # 5. Google Custom Search (if API keys provided)
        url = self.try_google_search(uni_name, google_api_key, google_cx)
        if url:
            logging.info(f"  Found via Google: {url}")
            logo_data = self.download_and_validate_logo(url)
            if logo_data:
                return logo_data
        
        logging.warning(f"  No logo found for {uni_name}")
        return None

def load_missing_logos(missing_file: Path) -> List[Dict]:
    """Load missing logos list."""
    with open(missing_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get('missing_logos', [])

def save_logo_file(logo_data: bytes, output_path: Path) -> bool:
    """Save logo data to file."""
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(logo_data)
        return True
    except Exception as e:
        logging.error(f"Failed to save logo to {output_path}: {e}")
        return False

def resize_logo(input_path: Path, target_size: tuple = (200, 200)):
    """Resize logo to target size while maintaining aspect ratio."""
    try:
        with Image.open(input_path) as img:
            # Calculate new size maintaining aspect ratio
            img.thumbnail(target_size, Image.Resampling.LANCZOS)
            
            # Save as PNG
            if input_path.suffix.lower() != '.png':
                new_path = input_path.with_suffix('.png')
                img.save(new_path, 'PNG', optimize=True)
                input_path.unlink()  # Remove old file
                return new_path
            else:
                img.save(input_path, 'PNG', optimize=True)
                return input_path
                
    except Exception as e:
        logging.error(f"Failed to resize {input_path}: {e}")
        return input_path

def main():
    parser = argparse.ArgumentParser(
        description='Download missing university logos from multiple sources'
    )
    
    parser.add_argument(
        '--missing-logos',
        type=Path,
        default='pipelines/data/missing_logos.json',
        help='Missing logos JSON file from check_missing_logos.py'
    )
    
    parser.add_argument(
        '--output-dir',
        type=Path,
        default='public/images/uni_images/uni_logos',
        help='Directory to save downloaded logos'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        help='Maximum number of logos to download (for testing)'
    )
    
    parser.add_argument(
        '--priority',
        choices=['high', 'medium', 'low'],
        help='Only download logos of specified priority'
    )
    
    parser.add_argument(
        '--delay',
        type=float,
        default=2.0,
        help='Delay between downloads in seconds (default: 2.0)'
    )
    
    parser.add_argument(
        '--google-api-key',
        help='Google Custom Search API key (optional)'
    )
    
    parser.add_argument(
        '--google-cx',
        help='Google Custom Search CX ID (optional)'
    )
    
    parser.add_argument(
        '--resize',
        action='store_true',
        help='Resize downloaded logos to standard size'
    )
    
    args = parser.parse_args()
    
    # Validation
    if not args.missing_logos.exists():
        logging.error(f"Missing logos file not found: {args.missing_logos}")
        logging.info("Run check_missing_logos.py first to generate this file")
        return 1
    
    # Load missing logos
    logging.info(f"Loading missing logos from {args.missing_logos}")
    missing_logos = load_missing_logos(args.missing_logos)
    
    # Filter by priority if specified
    if args.priority:
        missing_logos = [x for x in missing_logos if x['priority'] == args.priority]
    
    # Limit if specified
    if args.limit:
        missing_logos = missing_logos[:args.limit]
    
    if not missing_logos:
        logging.info("No logos to download")
        return 0
    
    logging.info(f"Will attempt to download {len(missing_logos)} logos")
    
    # Initialize scraper
    scraper = LogoScraper()
    
    # Download logos
    successful = 0
    failed = 0
    
    for i, university in enumerate(missing_logos, 1):
        logging.info(f"[{i}/{len(missing_logos)}] Processing {university['name']}")
        
        try:
            logo_data = scraper.scrape_university_logo(
                university, 
                google_api_key=args.google_api_key,
                google_cx=args.google_cx
            )
            
            if logo_data:
                output_path = args.output_dir / university['expected_filename']
                if save_logo_file(logo_data, output_path):
                    successful += 1
                    logging.info(f"  ✓ Saved to {output_path}")
                    
                    # Resize if requested
                    if args.resize:
                        resize_logo(output_path)
                else:
                    failed += 1
            else:
                failed += 1
                logging.warning(f"  ✗ No logo found")
            
            # Rate limiting
            if i < len(missing_logos):
                time.sleep(args.delay)
                
        except KeyboardInterrupt:
            logging.info("Download interrupted by user")
            break
        except Exception as e:
            logging.error(f"  Error processing {university['name']}: {e}")
            failed += 1
            continue
    
    # Summary
    total = successful + failed
    logging.info("=" * 60)
    logging.info("LOGO DOWNLOAD COMPLETE")
    logging.info(f"Total processed: {total}")
    logging.info(f"Successfully downloaded: {successful}")
    logging.info(f"Failed: {failed}")
    if total > 0:
        logging.info(f"Success rate: {successful/total*100:.1f}%")
    
    if successful > 0:
        logging.info(f"Downloaded logos saved to: {args.output_dir}")
        if args.resize:
            logging.info("Note: Run pipelines/resize_images.py to standardize all logo sizes")
    logging.info("=" * 60)
    
    return 0

if __name__ == "__main__":
    exit(main())