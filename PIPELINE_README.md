# University Course Data & Logo Pipeline

A comprehensive system for fetching, processing, and managing Italian university course data and logos.

## 🚀 Quick Start

### 1. Setup
```bash
# Install Python dependencies
make setup

# Or manually:
pip install -r requirements.txt
mkdir -p pipelines/data pipelines/logs
```

### 2. Run Development Pipeline
```bash
# NPM scripts (recommended)
npm run pipeline:dev

# Or using Make
make pipeline-dev
```

### 3. Check Status
```bash
npm run pipeline:status
# or
make status
```

## 📋 Available Commands

### NPM Scripts (Recommended)
```bash
npm run data:fetch        # Fetch latest production data
npm run data:fetch-dev    # Fetch development sample
npm run data:upload       # Upload to Firestore
npm run logos:check       # Check missing logos
npm run logos:download    # Download high-priority logos
npm run logos:validate    # Validate all logos
npm run pipeline          # Complete production pipeline
npm run pipeline:dev      # Development pipeline
npm run pipeline:status   # Show status
```

### Make Commands
```bash
make help                 # Show all commands
make pipeline             # Complete production pipeline
make pipeline-dev         # Development pipeline  
make logo-pipeline        # Logo-only pipeline
make test                 # Run tests
make clean               # Clean generated files
make status              # Show pipeline status
```

## 🏗️ Architecture

### Pipeline Flow
```
1. Fetch Data → 2. Process → 3. Extract Unis → 4. Check Logos → 5. Download → 6. Validate → 7. Upload
     ↓              ↓            ↓               ↓              ↓           ↓           ↓
  Raw JSON    Processed    universities.csv   missing.json   Logo Files  Report    Firestore
```

### File Structure
```
pipelines/
├── fetch_courses_data.py      # Data fetching & processing
├── list_universities.py       # Extract university list
├── check_missing_logos.py     # Find missing logos
├── download_university_logos.py # Multi-source logo scraper
├── validate_logos.py          # Logo validation
├── update_courses.py          # Firestore upload
├── resize_images.py           # Logo resizing
├── data/                      # Generated data files
└── logs/                      # Pipeline logs

src/lib/universityLogo.ts      # Frontend logo utilities
public/images/uni_images/uni_logos/  # Logo files
```

## 🔧 Component Details

### 1. Data Fetching (`fetch_courses_data.py`)
**Enhanced with:**
- CLI flags for environment, fetching, classification
- Retry logic with exponential backoff
- Rate limiting and error handling
- Optional AI classification (OpenAI API)
- Comprehensive logging

```bash
# Examples
python pipelines/fetch_courses_data.py --env production --fetch --sleep 1.5
python pipelines/fetch_courses_data.py --env development --fetch --classify
```

### 2. University Extraction (`list_universities.py`)
Extracts canonical university list with:
- Course counts per university
- Existing logo status
- Course examples for reference

Output: `pipelines/data/universities.csv`

### 3. Missing Logo Detection (`check_missing_logos.py`)
**Smart detection with:**
- Priority levels (high/medium/low by course count)
- Domain guessing for Italian universities
- Manual override template generation
- Expected filename resolution

Output: `pipelines/data/missing_logos.json`

### 4. Logo Downloading (`download_university_logos.py`)
**Multi-source scraping:**
- 🥇 **Manual overrides** (CSV file)
- 🥈 **Official websites** (direct scraping)
- 🥉 **Clearbit Logo API** (free, high-quality)
- 🏅 **Wikipedia/Wikimedia** (comprehensive)
- ⭐ **Google Custom Search** (requires API key)

**Features:**
- Image validation & format conversion
- Automatic PNG conversion with transparency
- Rate limiting and retry logic
- Quality checks (size, format, dimensions)

### 5. Frontend Integration
**Dynamic alias loading:**
- `useUniversityAliases()` hook
- Fallback to hardcoded aliases
- Client-side caching
- Progressive enhancement

## 🎯 Usage Scenarios

### Daily Operations
```bash
# Check what needs updating
make status

# Download new logos
npm run logos:check
npm run logos:download

# Validate everything is working
npm run logos:validate
```

### Full Data Refresh
```bash
# Complete pipeline (production)
npm run pipeline

# Then upload to Firestore
npm run data:upload
```

### Development & Testing
```bash
# Quick development cycle
npm run pipeline:dev

# Test logo downloading
make download-logos-test

# Validate sample
make validate-sample
```

### Logo Management
```bash
# Logo-only workflow
make logo-pipeline

# High-priority logos only
make download-logos-high

# Clean and restart
make clean-logos
```

## ⚙️ Configuration

### Environment Variables
```bash
# Optional: Google Custom Search (better logo results)
export GOOGLE_API_KEY="your-api-key"
export GOOGLE_CX="your-search-engine-id"

# Firebase (for upload)
export LOCAL_ENV=true  # Use emulator
```

### Manual Logo Overrides
Edit `pipelines/data/manual_logo_overrides.csv`:
```csv
university_id,university_name,logo_url,notes
universita_bocconi,Università Bocconi,https://example.com/logo.png,Official logo
```

### Aliases Configuration
Edit `public/images/uni_images/uni_logos/aliases.json`:
```json
{
  "universita_degli_studi_di_perugia": "23",
  "libera_universita_di_bolzano": "C3"
}
```

## 🔍 Monitoring & Debugging

### Status Checking
```bash
make status                    # Overall pipeline status
npm run logos:validate         # Logo validation report
cat pipelines/logs/fetch_courses.log  # Detailed logs
```

### Common Issues

**No logos found:**
- Check internet connection
- Verify aliases.json exists
- Run `make download-logos-test` first

**API rate limiting:**
- Increase `--sleep` parameter
- Use `--delay` for logo downloads
- Check API quotas

**Data processing fails:**
- Check raw data files exist
- Verify Python dependencies
- Review logs in `pipelines/logs/`

**Frontend logos not loading:**
- Verify aliases.json in public folder
- Check browser network tab
- Ensure files are properly sized

## 📊 Performance & Optimization

### Logo Sources Performance
1. **Clearbit API**: Fast, high-quality, free
2. **Official websites**: Good quality, moderate speed  
3. **Wikipedia**: Comprehensive, slower
4. **Google Search**: Excellent results, requires API key

### Optimization Tips
- Use `--priority high` for important universities first
- Enable `--classify` only when needed (costs OpenAI credits)
- Set appropriate `--sleep` times to avoid rate limiting
- Use `--sample` for testing before full runs

## 🧪 Testing

```bash
# Full test suite
make test

# Individual components
make fetch-dev              # Test data fetching
make download-logos-test    # Test 5 logo downloads
make validate-sample        # Test logo validation
```

## 🚨 Troubleshooting

### Pipeline Stuck/Errors
1. Check logs: `ls pipelines/logs/`
2. Verify data files: `make status`
3. Test individual components
4. Clean and restart: `make clean`

### Logo Quality Issues
1. Run validation: `npm run logos:validate`
2. Check manual overrides needed
3. Verify logo file sizes/formats
4. Re-run with different sources

### Frontend Integration Issues
1. Check browser console for alias loading
2. Verify aliases.json is accessible
3. Test with network tab open
4. Ensure proper fallback to default logo

## 📚 API References

### Universitaly API
- Endpoint: `https://universitaly-backend.cineca.it/api/offerta-formativa/cerca-corsi`
- Rate limit: ~1 request/second recommended
- Returns: Paginated course data

### Logo Sources
- **Clearbit**: `https://logo.clearbit.com/{domain}`
- **Wikipedia**: `https://it.wikipedia.org/api/rest_v1/page/summary/`
- **Wikimedia**: `https://commons.wikimedia.org/w/api.php`
- **Google**: Custom Search API v1

## 📈 Future Improvements

- [ ] Add university website detection
- [ ] Implement logo quality scoring with AI
- [ ] Add automatic logo updates
- [ ] Create admin UI for logo management
- [ ] Add university metadata management in Firestore
- [ ] Implement logo CDN with Firebase Storage
- [ ] Add course data versioning
- [ ] Create automated data quality reports

---

## 💡 Pro Tips

1. **Start with development pipeline** to test everything
2. **Use manual overrides** for important universities
3. **Monitor logs** during long-running operations  
4. **Run validation** after any logo changes
5. **Keep aliases.json** updated for performance
6. **Use priority flags** to focus on high-impact logos first

For questions or issues, check the logs first, then refer to this documentation.