#!/usr/bin/env bash
# FraudGraph AI — Local Launcher Script
# Starts both the Spring Boot 3 Backend and Vite + React Frontend

set -e

# Detect Java 17+ on macOS Homebrew if JAVA_HOME is not set
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
    elif [ -d "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
    elif [ -d "/opt/homebrew/Cellar/openjdk@17/17.0.17/libexec/openjdk.jdk/Contents/Home" ]; then
        export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.17/libexec/openjdk.jdk/Contents/Home"
    elif [ -x "/usr/libexec/java_home" ]; then
        export JAVA_HOME="$(/usr/libexec/java_home -v 17+ 2>/dev/null || /usr/libexec/java_home 2>/dev/null || true)"
    fi
fi

echo "=========================================================="
echo " FraudGraph AI — Adaptive Financial Fraud Intelligence"
echo "=========================================================="
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "Node Version: $(node -v 2>/dev/null || echo 'Not found')"
echo "=========================================================="

# Trap to kill background backend on exit
cleanup() {
    echo ""
    echo "Shutting down FraudGraph AI services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend in Background
echo "Starting Spring Boot Backend on http://localhost:8080..."
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/fraudgraph_backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Waiting for Spring Boot backend to become ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/analytics/summary >/dev/null 2>&1; then
        echo "Backend is ready! (PID: $BACKEND_PID)"
        break
    fi
    sleep 1
    echo -n "."
done

# 2. Start Frontend
echo ""
echo "Starting React Frontend on http://localhost:5173..."
cd frontend
npm run dev
