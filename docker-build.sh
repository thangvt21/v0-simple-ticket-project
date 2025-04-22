#!/bin/bash

# Build the Docker image
docker build -t issue-tracker .

# Create a Docker network if it doesn't exist
docker network create server-network || true

# Run the container with environment variables
docker run -d \
  --name issue-tracker \
  --network server-network \
  -p 3000:3000 \
  -e MYSQL_HOST=your-mysql-host \
  -e MYSQL_USER=your-mysql-user \
  -e MYSQL_PASSWORD=your-mysql-password \
  -e MYSQL_DATABASE=your-mysql-database \
  issue-tracker
