#!/bin/bash

echo "🛑 Stopping all development services..."

# Function to kill processes safely
kill_process() {
    local process_name="$1"
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "Stopping $process_name processes: $pids"
        kill $pids 2>/dev/null
        sleep 2
        # Force kill if still running
        local remaining_pids=$(pgrep -f "$process_name" 2>/dev/null)
        if [ -n "$remaining_pids" ]; then
            echo "Force stopping $process_name processes: $remaining_pids"
            kill -9 $remaining_pids 2>/dev/null
        fi
    fi
}

# Stop Firebase emulators
echo "🔥 Stopping Firebase emulators..."
kill_process "firebase emulators:start"
kill_process "firebase.*emulator"

# Stop Next.js dev server
echo "⚛️  Stopping Next.js dev server..."
kill_process "next dev"
kill_process "next-server"

# Kill processes by port if they're still running
echo "🔌 Checking and stopping processes on development ports..."
for port in 3000 4000 5001 8080 9099 9199; do
    pid=$(lsof -t -i:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "Stopping process on port $port (PID: $pid)"
        kill $pid 2>/dev/null
        sleep 1
        # Force kill if still running
        pid=$(lsof -t -i:$port 2>/dev/null)
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null
        fi
    fi
done

echo "✅ All development services stopped!"

# Verify ports are free
echo "📋 Port status:"
for port in 3000 4000 5001 8080 9099 9199; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "  Port $port: STILL IN USE ❌"
    else
        echo "  Port $port: FREE ✅"
    fi
done