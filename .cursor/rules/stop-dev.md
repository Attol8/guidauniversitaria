# /stop-dev

This command stops all development services for Guida Universitaria using the robust cleanup method.

## What it does:

1. **Stop Firebase emulators** - Kills Firebase emulator processes by name
2. **Stop Next.js dev server** - Kills Next.js development server processes  
3. **Clean up processes by port** - Kills any remaining processes on development ports
4. **Verify cleanup** - Reports the status of all development ports

## Usage:
```
/stop-dev
```

## Services stopped:
- Firebase Emulator UI (port 4000)
- Firestore emulator (port 8080)
- Auth emulator (port 9099)
- Functions emulator (port 5001)
- Storage emulator (port 9199)
- Next.js development server (port 3000)

## Port verification:
The command will check and report the status of all development ports:
- Port 3000: Next.js dev server
- Port 4000: Firebase Emulator UI
- Port 5001: Firebase Functions
- Port 8080: Firestore
- Port 9099: Firebase Auth
- Port 9199: Firebase Storage

## Method:
Uses the proven `./stop_services.sh` script for reliable cleanup.