# /setup-dev

This command sets up the complete development environment for Guida Universitaria using the proven working method.

## What it does:

1. **Process course data** - Runs `python pipelines/fetch_courses_data.py` to process course data with GPT classification
2. **Start Firebase emulators** - Launches all Firebase services in background using environment variables
3. **Upload data to Firestore** - Runs `python pipelines/update_courses.py` to populate emulator with course data
4. **Verify services** - Confirms Firebase Emulator UI and Firestore are responding

## Usage:
```
/setup-dev
```

## Prerequisites:
- Python packages already installed (the working setup doesn't require requirements.txt)
- Firebase CLI installed
- `.env.production` file with `OPENAI_API_KEY` (for course classification - optional)
- `dev_firebase_config.json` in project root

## Services started:
- Firebase Emulator UI: http://127.0.0.1:4000/
- Firestore: 127.0.0.1:8080
- Auth: 127.0.0.1:9099
- Functions: 127.0.0.1:5001
- Storage: 127.0.0.1:9199

## To stop services:
Use `/stop-dev` command

## Manual steps after running this command:
1. Run `npm run dev` to start the Next.js development server
2. Access the application at http://localhost:3000