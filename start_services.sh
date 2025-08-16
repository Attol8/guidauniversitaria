#!/bin/bash

echo "🚀 Starting development services for Guida Universitaria..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

if [ ! -f "dev_firebase_config.json" ]; then
    echo "❌ dev_firebase_config.json not found - required for Firebase emulators"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found - GPT classification may not work"
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Check if ports are available
echo "🔌 Checking ports..."
ports_ok=true
for port in 3000 4000 5001 8080 9099 9199; do
    if ! check_port $port; then
        ports_ok=false
    fi
done

if [ "$ports_ok" = false ]; then
    echo "❌ Some ports are in use. Run ./stop_services.sh first or /stop-dev command."
    exit 1
fi

# Step 1: Process course data
echo "📊 Step 1: Processing course data..."

# Load environment variables
set -o allexport
[ -f .env.production ] && source .env.production
set +o allexport

if ! python pipelines/fetch_courses_data.py; then
    echo "❌ Failed to process course data"
    exit 1
fi

# Step 2: Start Firebase emulators in background
echo "🔥 Step 2: Starting Firebase emulators..."
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
export no_proxy=*
firebase emulators:start &
FIREBASE_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for Firebase emulators to initialize..."
sleep 15

# Check if Firebase emulators are running
if ! kill -0 $FIREBASE_PID 2>/dev/null; then
    echo "❌ Firebase emulators failed to start"
    exit 1
fi

# Step 3: Upload data to Firestore
echo "📤 Step 3: Uploading course data to Firestore..."
if ! python pipelines/update_courses.py; then
    echo "❌ Failed to upload course data"
    kill $FIREBASE_PID 2>/dev/null
    exit 1
fi

echo "✅ Firebase emulators ready!"
echo ""

# Step 4: Start Next.js development server
echo "⚛️ Step 4: Starting Next.js development server..."

# Start Next.js in background
npm run dev &
NEXTJS_PID=$!

# Wait a moment for Next.js to start
sleep 5

# Check if Next.js is running
if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo "❌ Next.js failed to start"
    kill $FIREBASE_PID 2>/dev/null
    exit 1
fi

echo "✅ All development services ready!"
echo ""
echo "🌐 Services running:"
echo "  • Next.js App: http://localhost:3000 (or 3001 if 3000 is busy)"
echo "  • Firebase Emulator UI: http://127.0.0.1:4000/"
echo "  • Firestore: 127.0.0.1:8080"  
echo "  • Auth: 127.0.0.1:9099"
echo "  • Functions: 127.0.0.1:5001"
echo "  • Storage: 127.0.0.1:9199"
echo ""
echo "🎯 Next steps:"
echo "  • Access your app at the Next.js URL above"
echo "  • Use './stop_services.sh' or '/stop-dev' to stop all services"
echo ""
echo "Process IDs for manual cleanup:"
echo "  • Firebase PID: $FIREBASE_PID"
echo "  • Next.js PID: $NEXTJS_PID"
echo ""
echo "⏳ Services will continue running in background..."
echo "Press Ctrl+C to stop all services"

# Create a cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $NEXTJS_PID 2>/dev/null
    kill $FIREBASE_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Keep script running and wait for user to stop
wait