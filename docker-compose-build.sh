#!/bin/bash

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please update the .env file with your actual credentials before continuing."
  exit 1
fi

# Create the network if it doesn't exist
docker network create server-network || true

# Build and start the containers with docker-compose
docker-compose up -d

echo "Containers are starting..."
echo "MySQL will be available at localhost:3306"
echo "Application will be available at http://localhost:3000"
echo ""
echo "MySQL Connection Information:"
echo "Host: localhost"
echo "Port: 3306"
echo "Database: $(grep MYSQL_DATABASE .env | cut -d '=' -f2)"
echo "Username: $(grep MYSQL_USER .env | cut -d '=' -f2)"
echo "Password: $(grep MYSQL_PASSWORD .env | cut -d '=' -f2)"
