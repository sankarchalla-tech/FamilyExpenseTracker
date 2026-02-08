# 🚀 Production Deployment Guide

## 📋 Prerequisites

- **Node.js 18+** and **npm**
- **MongoDB** database
- **Nginx** web server
- **PM2** process manager
- **Domain name** (optional but recommended)

## 🏗️ Production Build

### Frontend
```bash
cd frontend
npm ci --only=production
npm run build
```

### Backend
```bash
cd backend
npm ci --only=production
```

## 📦 Deployment Steps

### 1. Automated Deployment (Recommended)
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 2. Manual Deployment

#### Backend Setup
```bash
# Install dependencies
cd backend
npm ci --only=production

# Create production environment file
cp .env.example .env
# Edit .env with your production values

# Start with PM2
pm2 start server.js --name "family-expense-backend"
pm2 save
pm2 startup
```

#### Frontend Setup
```bash
# Build for production
cd frontend
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/family-expense-app/
sudo chown -R www-data:www-data /var/www/family-expense-app/
```

#### Nginx Configuration
```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/family-expense-app
sudo ln -s /etc/nginx/sites-available/family-expense-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/family-expense
JWT_SECRET=your-secure-jwt-secret-key
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env.production)
```env
VITE_API_URL=/api
```

## 🔒 Security Considerations

### Database Security
- Use strong MongoDB credentials
- Enable authentication
- Use connection string with SSL

### API Security
- Strong JWT secret (minimum 32 characters)
- Rate limiting on API endpoints
- HTTPS only in production
- Input validation and sanitization

### Nginx Security Headers
The provided nginx.conf includes:
- XSS Protection
- Content Type Protection
- Frame Options
- Referrer Policy
- Content Security Policy

## 📊 Monitoring

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs family-expense-backend

# Restart application
pm2 restart family-expense-backend
```

### Health Checks
- Application health: `http://your-domain.com/health`
- Database connectivity: Check backend logs

## 🔍 Performance Optimization

### Frontend Optimizations
- ✅ Bundle splitting (vendor, router, charts)
- ✅ Gzip compression enabled
- ✅ Static asset caching
- ✅ Source maps for debugging

### Backend Optimizations
- Use MongoDB indexing
- Implement API response caching
- Database connection pooling
- Enable compression

## 🚨 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### PM2 Process Not Starting
```bash
# Check logs
pm2 logs family-expense-backend

# Check configuration
pm2 show family-expense-backend
```

#### Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 list

# Check nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongo mongodb://localhost:27017/family-expense

# Check MongoDB service
sudo systemctl status mongod
```

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy to server
        run: |
          # Your deployment commands here
          ./deploy.sh
```

## 📱 Additional Features for Production

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Backup Strategy
- Daily database backups
- Code repository backups
- Configuration backups

### Logging
- Centralized logging (ELK stack)
- Error tracking (Sentry)
- Performance monitoring

## 📈 Scaling Considerations

- Load balancer setup
- Database replication
- Redis for caching
- CDN for static assets

---

## 🎯 Quick Start Production Checklist

- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Database secured
- [ ] Nginx configured
- [ ] PM2 process running
- [ ] Health checks passing
- [ ] Backup strategy implemented
- [ ] Monitoring setup

Your Family Expense Tracker is now production-ready! 🎉