# Data Pipeline Setup Documentation

## Overview
This document describes the data pipeline setup for uploading course data and filter collections to Firebase for the Guida Universitaria app.

## Authentication Setup

### Service Account Configuration
1. **Service Account File**: `.firebase-credentials.json`
   - Renamed from original service account file for security
   - Added to `.gitignore` to prevent accidental commits
   - Contains Firebase Admin SDK credentials for programmatic access

2. **Security Measures**:
   ```gitignore
   .firebase-credentials.json
   *firebase-adminsdk*.json
   ```

## Data Pipeline Scripts

### 1. Course Data Upload (`pipelines/update_courses.py`)
- **Purpose**: Upload course data to Firebase Firestore
- **Environment Support**: Both emulator and production
- **Authentication**: Service account credentials
- **Data Source**: `pipelines/data/test_courses_data.json` (24 courses)

### 2. Filter Collections Generator (`generate_filter_collections.py`)
- **Purpose**: Extract and upload filter collections from course data
- **Collections Created**:
  - `disciplines` (19 items)
  - `locations` (6 items) 
  - `universities` (7 items)
- **Data Structure**: Each filter item includes `name`, `coursesCounter`, and `courses` array

### 3. Emulator Upload (`upload_to_emulator.py`)
- **Purpose**: Upload data to local Firebase emulators via REST API
- **Target**: `http://localhost:8080` (Firestore emulator)
- **Project ID**: `demo-project`

## Environment Configuration

### Local Development (Emulators)
```env
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_USE_AUTH_EMULATOR=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
```

### Production/Hosted Environment
- Uses actual Firebase project: `guidauniversitaria`
- Service account authentication required
- All collections deployed with security rules

## Deployment Results

### Local Emulators
- **Status**: Configured and running
- **Data**: Uploaded via REST API
- **Access**: http://127.0.0.1:4000/firestore

### Hosted Environment
- **URL**: https://guidauniversitaria--guidauniversitaria.europe-west4.hosted.app/
- **Status**: ✅ Working - all collections loaded
- **Data**: 24 courses + filter collections
- **Console**: No errors, successful data fetching

## Filter Collections Data Structure

Each filter collection follows this structure:
```json
{
  "name": "Filter Name",
  "coursesCounter": 5,
  "courses": ["courseId1", "courseId2"]
}
```

## Commands Reference

```bash
# Upload to production Firebase
python3 generate_filter_collections.py

# Upload to local emulators
python3 upload_to_emulator.py

# Start development environment
./start_services.sh

# View emulator data
# Navigate to: http://127.0.0.1:4000/firestore
```