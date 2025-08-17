# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guida Universitaria is a Next.js application for discovering and filtering Italian university courses. It uses Firebase as the backend database and includes a course discovery system with advanced filtering capabilities.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `./start_services.sh` - Complete development setup (pipelines + Firebase emulators)
- `./stop_services.sh` - Stop all development services

## Claude Commands

- `/setup-dev` - Complete development setup (pipelines + Firebase emulators)
- `/stop-dev` - Stop all development services (including Next.js)

## Testing

### Manual Testing
- `npm run dev` - Start dev server (usually on localhost:3001 if 3000 is occupied)
- Navigate to `/corsi` to test course pagination and filtering
- Test pagination by applying filters to see results reset
- Check browser console for analytics events (`view_item_list`)

### Playwright Testing
- Use `tests/pagination.spec.ts` for automated pagination testing
- Covers: initial load, filtering, load more functionality, analytics events
- Run against localhost:3001 (or current dev server port)

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript and React 18
- **Styling**: Tailwind CSS with DaisyUI components
- **Database**: Firebase Firestore
- **Icons**: FontAwesome and React Icons
- **State Management**: React hooks and SWR for data fetching

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/styles/` - Global CSS and Tailwind configuration
- `pipelines/` - Data processing scripts and course data
- `functions/` - Firebase Cloud Functions
- `public/images/uni_images/` - University logos and hero images

### Core Components Architecture

**Course System**:
- `CourseGrid` - Main course listing component with Firebase integration
- `CourseCard` - Individual course display with university logos and metadata
- `FilterBar` - Advanced filtering by discipline, location, and university
- Filter data fetchers (`getTopDisciplines`, `getTopLocations`, `getTopUniversities`)

**Data Structure**:
Courses are stored in Firestore with nested objects for:
- `discipline` (id, name)
- `location` (id, name) 
- `university` (id, name)
- `degree_type`, `program_type`, `language`

### Firebase Configuration

- Development uses local emulators (ports: Firestore 8080, Auth 9099, Storage 9199, Functions 5001)
- Production uses environment variables for Firebase config
- Emulator connection is automatic in development mode

### Styling System

Custom Tailwind theme with:
- Primary colors: `#3e763d` (verde-alloro: `#2d572c`)
- Dark mode support via `next-themes`
- DaisyUI component library integration
- Custom breakpoints and shadows

### Current Development Focus

Based on README TODO:
- Course filtering system (implemented)
- Search functionality (basic implementation exists)
- Future: Pagination, user authentication, saved courses

## Firebase App Hosting Deployment

### Prerequisites
- Firebase CLI installed and authenticated
- Project configured for Firebase App Hosting
- Next.js application built for production

### Deployment Process
1. **Backend Creation**: Use `firebase apphosting:backends:create` to set up Cloud Run service
2. **Configuration**: App Hosting automatically configures:
   - Cloud Run service in `europe-west4` region
   - Service account: `firebase-app-hosting-compute@guidauniversitaria.iam.gserviceaccount.com`
   - Container deployment with Next.js production build
3. **Build & Deploy**: Firebase App Hosting handles automatic builds from repository
4. **Environment**: Production environment variables are configured in Firebase console

### Key Configuration Files
- `firebase.json` - Firebase project configuration
- `next.config.js` - Next.js configuration for App Hosting compatibility
- `.env.production` - Production environment variables

### Deployment Commands
- `firebase apphosting:backends:create` - Create new backend
- `firebase deploy --only apphosting` - Deploy to App Hosting
- `firebase apphosting:backends:list` - List all backends

### Monitoring
- Cloud Run logs available in Google Cloud Console
- Firebase App Hosting dashboard for deployment status
- Application accessible via provided App Hosting URL

## Data Management Workflow

### Firebase Projects
- **Dev**: `guidauniversitaria` (878850539106) - for development and testing
- **Prod**: `guidauniversitaria-prod` (817549673617) - for production

### Data Pipeline Commands

**Fetch and Process Data:**
```bash
# Development data (test dataset - 2 pages)
python3 pipelines/fetch_courses_data.py --env development --fetch

# Production data (full dataset with AI classification)
python3 pipelines/fetch_courses_data.py --env production --fetch --classify
```

**Upload to Firebase:**
```bash
# Programmatic upload (recommended for dev testing)
source functions/venv/bin/activate
python3 pipelines/update_courses.py --env development

# OR use Makefile shortcut
make upload

# Manual upload via Firebase Console (alternative):
# 1. Go to https://console.firebase.google.com/project/guidauniversitaria/firestore
# 2. Import data from pipelines/data/test_courses_data.json
```

**Firebase Authentication Setup:**
For programmatic uploads, you need a service account key:
1. Go to: https://console.firebase.google.com/project/guidauniversitaria/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save as `.firebase-credentials.json` in project root
4. File is automatically ignored by git for security

### Local Emulator Data Export/Import
```bash
# Export local emulator data
firebase emulators:export ./local-data

# Import to production (WARNING: overwrites existing data)
firebase use guidauniversitaria-prod
firebase firestore:import ./local-data

# Import to dev
firebase use guidauniversitaria
firebase firestore:import ./local-data
```

### Data Pipeline Files
- `fetch_courses_data.py` - Fetches and processes course data from Universitaly API
- `update_courses.py` - Uploads processed data to Firebase Firestore
- `data/test_courses_data.json` - Development dataset (2 pages)
- `data/all_courses_data.json` - Production dataset (full)

## Important Notes

- University images are dynamically loaded with fallbacks to placeholder images
- Course cards use random hero images from `/images/uni_images/uni_heroes/`
- Logo loading includes existence checks with fallback to placeholder
- Mobile-responsive design with Tailwind grid system

## Firestore Indexes

The app requires composite indexes for filtering functionality. If you encounter errors like "The query requires an index", deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

Required indexes are defined in `firestore.indexes.json` and include combinations of:
- `discipline.id` + `nomeCorso`
- `location.id` + `nomeCorso` 
- `university.id` + `nomeCorso`
- Multiple filter combinations

**Note**: Indexes take 2-5 minutes to build after deployment.

## Firebase Functions

The project includes Cloud Functions for enhanced search functionality:

**Deployed Functions:**
- `search_courses` - Fuzzy search for course names
- `search_universities` - Fuzzy search for universities

**Available but not deployed:**
- `search_locations` - Fuzzy search for locations  
- Database triggers for maintaining counter fields automatically

**Function URLs:**
- Search courses: `https://us-central1-guidauniversitaria.cloudfunctions.net/search_courses?term=query`
- Search universities: `https://us-central1-guidauniversitaria.cloudfunctions.net/search_universities?term=query`

**Deploy functions:**
```bash
firebase deploy --only functions
```

**Note**: First-time function deployment may require waiting for service account permissions to propagate.