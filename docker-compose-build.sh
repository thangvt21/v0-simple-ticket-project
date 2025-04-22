#!/bin/bash

# Create a .env file with MySQL connection details
cat > .env << EOL
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-mysql-database
EOL

# Create the network if it doesn't exist
docker network create server-network || true

# Build and start the container with docker-compose
docker-compose up -d
