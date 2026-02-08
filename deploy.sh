#!/bin/bash

# Production Deployment Script for Family Expense Tracker

set -e

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="family-expense-app"
BACKUP_DIR="/var/backups/$APP_NAME"
DEPLOY_DIR="/var/www/$APP_NAME"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
BACKEND_DIR="$DEPLOY_DIR/backend"

echo -e "${YELLOW}📦 Creating backup directory...${NC}"
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $DEPLOY_DIR

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists pm2; then
    echo -e "${YELLOW}⚠️  PM2 not found, installing...${NC}"
    npm install -g pm2
fi

# Backup current version if exists
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}💾 Creating backup...${NC}"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp -r $DEPLOY_DIR "$BACKUP_DIR/$BACKUP_NAME"
    echo -e "${GREEN}✅ Backup created: $BACKUP_NAME${NC}"
fi

# Deploy frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd frontend
npm ci --only=production
npm run build

echo -e "${YELLOW}📂 Deploying frontend files...${NC}"
sudo rm -rf $FRONTEND_DIR
sudo mkdir -p $FRONTEND_DIR
sudo cp -r dist/* $FRONTEND_DIR/
sudo chown -R www-data:www-data $FRONTEND_DIR
echo -e "${GREEN}✅ Frontend deployed successfully${NC}"

# Deploy backend
echo -e "${YELLOW}🏗️  Deploying backend...${NC}"
cd ../backend
npm ci --only=production

# Create .env file if not exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file for backend...${NC}"
    sudo cp .env.example .env 2>/dev/null || echo "NODE_ENV=production\nPORT=5000\nMONGODB_URI=mongodb://localhost:27017/family-expense\nJWT_SECRET=your-jwt-secret-key" | sudo tee .env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
fi

echo -e "${YELLOW}📂 Deploying backend files...${NC}"
sudo rm -rf $BACKEND_DIR
sudo mkdir -p $BACKEND_DIR
sudo cp -r . $BACKEND_DIR/
sudo chown -R www-data:www-data $BACKEND_DIR

# Install backend dependencies
cd $BACKEND_DIR
sudo -u www-data npm ci --only=production
echo -e "${GREEN}✅ Backend deployed successfully${NC}"

# Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
if pm2 list | grep -q "family-expense-backend"; then
    sudo -u www-data pm2 restart family-expense-backend
else
    sudo -u www-data pm2 start server.js --name "family-expense-backend"
fi

echo -e "${YELLOW}🔧 Setting up PM2 startup...${NC}"
sudo -u www-data pm2 startup
sudo -u www-data pm2 save

# Update Nginx configuration
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
    sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
    sudo ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/$APP_NAME"
fi

sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📍 Frontend: http://your-domain.com${NC}"
echo -e "${GREEN}📍 API: http://your-domain.com/api${NC}"
echo -e "${YELLOW}💡 To monitor the application: pm2 monit${NC}"
echo -e "${YELLOW}💡 To view logs: pm2 logs family-expense-backend${NC}"