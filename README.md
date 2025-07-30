# Guida Universitaria

## Development Setup

### Prerequisites
- Node.js and npm
- Python 3.x with pip
- Firebase CLI

### Data Pipeline Setup

The application requires running data pipelines to prepare course data before starting the development server.

#### Pipeline Scripts Overview

1. **`fetch_courses_data.py`** - Fetches course data from Italian university API
   - Fetches raw course data from universitaly-backend.cineca.it
   - Uses GPT-4 to classify courses into disciplines
   - Processes and normalizes course data (names, locations, universities)
   - Saves processed data to JSON files

2. **`gpt_classify_courses.py`** - GPT-powered course classification
   - Classifies courses into predefined disciplines using OpenAI API
   - Requires OPENAI_API_KEY in `.env.production`

3. **`update_courses.py`** - Uploads data to Firebase
   - Uploads processed course data to Firestore
   - Connects to Firebase emulators in development
   - Requires `dev_firebase_config.json` for development

4. **`resize_images.py`** - Image processing for university logos
   - Resizes and converts university logos to consistent format

#### Running Pipelines for Development

1. **Set up Python environment:**
   ```bash
   cd pipelines
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   - Create `.env.production` with `OPENAI_API_KEY=your_key_here`
   - Ensure `dev_firebase_config.json` exists in project root

3. **Run data pipeline:**
   ```bash
   # Process course data (uses existing test data by default)
   python fetch_courses_data.py
   
   # Start Firebase emulators
   ./start_emulator.sh
   
   # Upload data to Firestore emulator (run in separate terminal)
   python update_courses.py
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Development Commands
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application
- `npm run lint` - Run ESLint
- `./start_emulator.sh` - Start Firebase emulators

## TODO

* [x] Create a search bar with minimal functionality, search on course name. Not styled or complete.
* [x] Create a component that display filters per category
* [] Add useful categories to the course cards (Luogo, Universita', Corso) (see courses_eda.ipynb)
* [] restyle navbar to add the above categories 
* [] Add filter functionality to the courses pages
* [] Pagination
* [] Users can save courses to a list
* [] Authentication
