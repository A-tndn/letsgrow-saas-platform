#!/bin/bash

# Frontend startup script for Replit environment
# This ensures clean port allocation and prevents conflicts during remix

# Kill any existing processes on port 5000 (just in case)
echo "Checking for existing processes on port 5000..."
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "Found existing process on port 5000, stopping it..."
    kill -9 $(lsof -ti:5000) 2>/dev/null || true
    sleep 2
fi

# Start the frontend
echo "Starting frontend on port 5000..."
npm run dev