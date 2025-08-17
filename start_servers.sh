#!/bin/bash

# Script to start both the frontend HTTP server and the Flask API server
# for the Mood-Based Music Player application

echo "Starting Mood-Based Music Player servers..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:"$1" &>/dev/null
  return $?
}

# Check if ports are already in use
if is_port_in_use 8000; then
  echo "Warning: Port 8000 is already in use. Frontend server might not start properly."
fi

if is_port_in_use 5002; then
  echo "Warning: Port 5002 is already in use. API server might not start properly."
fi

# Start the Flask API server in the background
echo "Starting Flask API server on port 5002..."
cd "$SCRIPT_DIR/src/services"
python api.py &
API_PID=$!
cd "$SCRIPT_DIR"

# Give the API server a moment to start
sleep 2

# Check if API server started successfully
if ! is_port_in_use 5002; then
  echo "Error: Failed to start Flask API server."
  exit 1
fi

echo "Flask API server started with PID: $API_PID"

# Start the frontend HTTP server in the background
echo "Starting frontend HTTP server on port 8000..."
python -m http.server 8000 &
HTTP_PID=$!

# Check if HTTP server started successfully
sleep 2
if ! is_port_in_use 8000; then
  echo "Error: Failed to start frontend HTTP server."
  kill $API_PID
  exit 1
fi

echo "Frontend HTTP server started with PID: $HTTP_PID"

# Print success message with URLs
echo ""
echo "Servers started successfully!"
echo "Frontend: http://localhost:8000"
echo "API: http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to clean up processes on exit
cleanup() {
  echo ""
  echo "Stopping servers..."
  kill $HTTP_PID $API_PID 2>/dev/null
  echo "Servers stopped."
  exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup INT TERM

# Wait for user to press Ctrl+C
wait
