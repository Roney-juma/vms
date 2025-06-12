#!/bin/bash

# Exit on error
set -e

APP_DIR="/home/ubuntu/visitor-management"
PM2_APP_NAME="visitor-management"

echo "Starting deployment..."

cd $APP_DIR

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Setup environment variables
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cp .env.example .env
  # You might want to add automated secret injection here
fi

# Database migrations (if using)
# npx sequelize-cli db:migrate

# Restart the application
echo "Restarting application..."
pm2 delete $PM2_APP_NAME || true
pm2 start server.js --name $PM2_APP_NAME

echo "Deployment completed successfully!"