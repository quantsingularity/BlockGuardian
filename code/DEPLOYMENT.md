# BlockGuardian Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying BlockGuardian in production environments. The platform is designed for financial services and requires careful attention to security, compliance, and scalability considerations.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores (8 recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB SSD (500GB recommended)
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04 LTS or CentOS 8

#### Recommended Production Requirements
- **CPU**: 8+ cores
- **RAM**: 32GB+
- **Storage**: 1TB+ NVMe SSD
- **Network**: 10Gbps connection with redundancy
- **Load Balancer**: HAProxy or AWS ALB
- **CDN**: CloudFlare or AWS CloudFront

### Software Dependencies

- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 14+
- Redis 7+
- Nginx 1.20+
- SSL Certificate (Let's Encrypt or commercial)

## Security Considerations

### Network Security
- Configure firewall rules (UFW/iptables)
- Use VPN for administrative access
- Implement DDoS protection
- Enable fail2ban for intrusion prevention

### Data Protection
- Enable database encryption at rest
- Configure SSL/TLS for all communications
- Implement proper key management
- Regular security audits and penetration testing

### Compliance Requirements
- GDPR compliance for EU users
- SOX compliance for financial reporting
- PCI DSS for payment processing
- Regular compliance audits

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y nginx certbot python3-certbot-nginx htop iotop
```

### 2. SSL Certificate Setup

```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Or upload commercial certificate
sudo mkdir -p /etc/nginx/ssl
sudo cp your-certificate.crt /etc/nginx/ssl/
sudo cp your-private-key.key /etc/nginx/ssl/
```

### 3. Environment Configuration

```bash
# Clone repository
git clone https://github.com/abrar2030/BlockGuardian.git
cd BlockGuardian/code

# Copy environment template
cp backend/.env.example backend/.env

# Edit configuration
nano backend/.env
```

### 4. Database Setup

```bash
# Create production database
sudo -u postgres createdb blockguardian_prod
sudo -u postgres createuser blockguardian_user
sudo -u postgres psql -c "ALTER USER blockguardian_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE blockguardian_prod TO blockguardian_user;"

# Configure PostgreSQL for production
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: shared_buffers = 256MB, effective_cache_size = 1GB, work_mem = 4MB
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Initialize database
docker-compose exec backend flask db upgrade
docker-compose exec backend flask seed-data

# Verify deployment
docker-compose ps
docker-compose logs -f backend
```

### Method 2: Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n blockguardian
kubectl logs -f deployment/backend -n blockguardian
```

### Method 3: Manual Deployment

```bash
# Backend deployment
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export FLASK_ENV=production
gunicorn -w 4 -b 0.0.0.0:5000 "src.main:create_app()"

# Frontend deployment
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
```

## Configuration Files

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/blockguardian
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Systemd Service Files

```ini
# /etc/systemd/system/blockguardian-backend.service
[Unit]
Description=BlockGuardian Backend API
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=blockguardian
Group=blockguardian
WorkingDirectory=/opt/blockguardian/backend
Environment=FLASK_ENV=production
ExecStart=/opt/blockguardian/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 "src.main:create_app()"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Monitoring and Logging

### Application Monitoring

```bash
# Prometheus metrics endpoint
curl http://localhost:5000/metrics

# Health check endpoint
curl http://localhost:5000/health

# Application logs
tail -f /var/log/blockguardian/app.log
```

### System Monitoring

```bash
# Install monitoring tools
sudo apt install -y prometheus grafana-server

# Configure Prometheus
sudo nano /etc/prometheus/prometheus.yml

# Start services
sudo systemctl enable prometheus grafana-server
sudo systemctl start prometheus grafana-server
```

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/blockguardian

# ELK Stack setup
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.17.0
docker run -d --name kibana -p 5601:5601 --link elasticsearch:elasticsearch kibana:7.17.0
```

## Backup and Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U blockguardian_user blockguardian_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

# Schedule with cron
0 2 * * * /opt/scripts/backup_db.sh
```

### File System Backup

```bash
# Rsync backup
rsync -avz --delete /opt/blockguardian/ backup-server:/backups/blockguardian/

# AWS S3 backup
aws s3 sync /opt/blockguardian/ s3://your-backup-bucket/blockguardian/
```

### Disaster Recovery

```bash
# Database restore
psql -h localhost -U blockguardian_user -d blockguardian_prod < backup_20240101_020000.sql

# Application restore
rsync -avz backup-server:/backups/blockguardian/ /opt/blockguardian/
docker-compose up -d
```

## Performance Optimization

### Database Optimization

```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

### Redis Optimization

```bash
# Redis configuration
echo 'maxmemory 512mb' >> /etc/redis/redis.conf
echo 'maxmemory-policy allkeys-lru' >> /etc/redis/redis.conf
systemctl restart redis
```

### Application Optimization

```bash
# Gunicorn optimization
gunicorn -w 8 --worker-class gevent --worker-connections 1000 -b 0.0.0.0:5000 "src.main:create_app()"

# Enable gzip compression
location / {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

## Security Hardening

### System Security

```bash
# Firewall configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban configuration
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
```

### Application Security

```bash
# Set secure file permissions
chmod 600 backend/.env
chmod 755 backend/src/
chown -R blockguardian:blockguardian /opt/blockguardian/

# Configure rate limiting
# Already implemented in Flask-Limiter configuration
```

## Compliance and Auditing

### Audit Logging

```python
# Enable comprehensive audit logging
AUDIT_LOG_ENABLED = True
AUDIT_LOG_LEVEL = 'INFO'
AUDIT_LOG_FILE = '/var/log/blockguardian/audit.log'
```

### Regulatory Compliance

```bash
# Generate compliance reports
docker-compose exec backend flask generate-compliance-report --type kyc_summary
docker-compose exec backend flask generate-compliance-report --type aml_activity
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U blockguardian_user -d blockguardian_prod
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   sudo systemctl status redis
   
   # Test connection
   redis-cli ping
   ```

3. **Application Errors**
   ```bash
   # Check application logs
   docker-compose logs backend
   
   # Check system resources
   htop
   df -h
   ```

### Performance Issues

```bash
# Monitor database performance
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Monitor Redis performance
redis-cli info stats

# Monitor system performance
iostat -x 1
```

## Maintenance

### Regular Maintenance Tasks

```bash
# Weekly tasks
- Update system packages
- Rotate logs
- Check disk space
- Review security logs
- Test backups

# Monthly tasks
- Security patches
- Performance review
- Compliance audit
- Capacity planning
```

### Updates and Upgrades

```bash
# Application updates
git pull origin main
docker-compose build
docker-compose up -d

# Database migrations
docker-compose exec backend flask db upgrade
```

## Support and Documentation

### Getting Help

- **Documentation**: https://docs.blockguardian.com
- **Support Email**: support@blockguardian.com
- **Emergency Contact**: +1-555-BLOCK-GUARD

### Additional Resources

- **API Documentation**: https://api.blockguardian.com/docs
- **Status Page**: https://status.blockguardian.com
- **Security Advisories**: https://security.blockguardian.com

---

**Note**: This deployment guide assumes a production environment with proper security measures. Always follow your organization's security policies and regulatory requirements.

