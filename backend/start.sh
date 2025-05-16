#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define variables
IMAGE_NAME="blockguardian-backend"
CONTAINER_NAME="blockguardian-backend-container"
FLASK_PORT=5001

# Function to build the Docker image
build_image() {
    echo "Building Docker image: $IMAGE_NAME..."
    docker build -t $IMAGE_NAME .
    echo "Docker image built successfully."
}

# Function to stop and remove existing container
cleanup_container() {
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        echo "Stopping and removing existing container: $CONTAINER_NAME..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        echo "Existing container removed."
    fi
}

# Function to run the Docker container
run_container() {
    echo "Running Docker container: $CONTAINER_NAME..."
    # You can add more Docker run options here, like volume mounts or environment variables from a file
    docker run -d -p $FLASK_PORT:$FLASK_PORT --name $CONTAINER_NAME $IMAGE_NAME
    echo "Container $CONTAINER_NAME started on port $FLASK_PORT."
    echo "Access the application at http://localhost:$FLASK_PORT"
}

# Function to show logs
show_logs() {
    echo "Showing logs for $CONTAINER_NAME... (Press Ctrl+C to stop)"
    docker logs -f $CONTAINER_NAME
}

# Function to stop the container
stop_container() {
    echo "Stopping container $CONTAINER_NAME..."
    docker stop $CONTAINER_NAME
    echo "Container $CONTAINER_NAME stopped."
}

# Main script logic
case "$1" in
    build)
        build_image
        ;;
    start)
        cleanup_container
        build_image # Rebuild on every start to ensure latest code
        run_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        cleanup_container
        build_image
        run_container
        ;;
    logs)
        show_logs
        ;;
    *) 
        echo "Usage: $0 {build|start|stop|restart|logs}"
        exit 1
        ;;
esac

exit 0

