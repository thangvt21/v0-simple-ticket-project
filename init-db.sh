#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Default values if not set in .env
MYSQL_HOST=${MYSQL_HOST:-localhost}
MYSQL_USER=${MYSQL_USER:-issueuser}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-issuepassword}
MYSQL_DATABASE=${MYSQL_DATABASE:-issue_tracker}

echo "Initializing database..."
echo "This will create all necessary tables and an admin user."

# Run the SQL script
mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < db-setup.sql

if [ $? -eq 0 ]; then
  echo "Database initialized successfully!"
  echo "You can now log in with:"
  echo "Username: admin"
  echo "Email: admin@example.com"
  echo "Password: admin123"
  echo ""
  echo "IMPORTANT: Change the admin password after your first login!"
else
  echo "Failed to initialize database. Please check your connection settings."
fi
