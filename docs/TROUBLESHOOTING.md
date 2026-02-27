# Troubleshooting Guide

Common issues and solutions for BlockGuardian platform.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Blockchain Issues](#blockchain-issues)
- [Database Issues](#database-issues)
- [Docker Issues](#docker-issues)
- [Network & API Issues](#network--api-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### Issue: Python module not found

**Symptoms:**

```
ModuleNotFoundError: No module named 'flask'
```

**Solution:**

```bash
# Ensure virtual environment is activated
cd code/backend
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: npm install fails

**Symptoms:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, try legacy peer deps
npm install --legacy-peer-deps
```

### Issue: Docker permission denied

**Symptoms:**

```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Restart Docker service
sudo systemctl restart docker
```

### Issue: Port already in use

**Symptoms:**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Find process using the port
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Or change port in .env file
PORT=5001
```

## Backend Issues

### Issue: Database connection failed

**Symptoms:**

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution:**

```bash
# Check PostgreSQL is running
docker ps | grep postgres
# OR
systemctl status postgresql

# Check DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/blockguardian

# Test connection
psql -h localhost -U postgres -d blockguardian

# Initialize database
python src/database/init_db.py
```

### Issue: Redis connection error

**Symptoms:**

```
redis.exceptions.ConnectionError: Error connecting to Redis
```

**Solution:**

```bash
# Check Redis is running
docker ps | grep redis
# OR
systemctl status redis

# Start Redis
docker-compose up redis -d
# OR
redis-server

# Check REDIS_URL in .env
REDIS_URL=redis://localhost:6379/0

# Test connection
redis-cli ping
```

### Issue: JWT token invalid

**Symptoms:**

```
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

**Solution:**

```bash
# Ensure JWT_SECRET_KEY is set in .env
JWT_SECRET_KEY=your-secret-key-here

# Generate new secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Token may be expired, login again
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Issue: Import errors

**Symptoms:**

```
ImportError: attempted relative import with no known parent package
```

**Solution:**

```bash
# Ensure you're running from correct directory
cd code/backend

# Add src to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:${PWD}/src"

# Or use absolute imports
from src.models.user import User
```

### Issue: Migration errors

**Symptoms:**

```
alembic.util.exc.CommandError: Target database is not up to date
```

**Solution:**

```bash
# Check migration status
flask db current

# Upgrade to latest
flask db upgrade

# If corrupted, reset database
flask db downgrade base
flask db upgrade
```

## Frontend Issues

### Issue: Next.js build fails

**Symptoms:**

```
Error: Module not found: Can't resolve 'components/...'
```

**Solution:**

```bash
# Clear .next cache
rm -rf .next

# Rebuild
npm run build

# Check imports are correct
# Use relative or absolute paths consistently
```

### Issue: API requests fail (CORS)

**Symptoms:**

```
Access to fetch at 'http://localhost:5000' has been blocked by CORS policy
```

**Solution:**

```bash
# Add frontend URL to backend CORS_ORIGINS
# In code/backend/.env:
CORS_ORIGINS=http://localhost:3000,http://localhost:19006

# Restart backend
python src/main.py
```

### Issue: Web3 provider not found

**Symptoms:**

```
Error: No provider found
```

**Solution:**

```bash
# Install MetaMask or another wallet
# https://metamask.io/download/

# Check provider URL in .env.local
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Test connection
curl $NEXT_PUBLIC_RPC_URL \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Issue: Environment variables not loading

**Symptoms:**

```
process.env.NEXT_PUBLIC_API_URL is undefined
```

**Solution:**

```bash
# Ensure file is named .env.local (not .env)
mv .env .env.local

# Variables must start with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=http://localhost:5000

# Restart dev server
npm run dev
```

## Blockchain Issues

### Issue: Hardhat compile fails

**Symptoms:**

```
Error HH600: Compilation failed
```

**Solution:**

```bash
# Clear cache
npx hardhat clean

# Reinstall dependencies
rm -rf node_modules
npm install

# Check Solidity version compatibility
# In hardhat.config.js:
solidity: "0.8.19"

# Recompile
npx hardhat compile
```

### Issue: Contract deployment fails

**Symptoms:**

```
Error: insufficient funds for gas * price + value
```

**Solution:**

```bash
# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia

# Get testnet ETH from faucet
# Sepolia: https://sepoliafaucet.com/
# Goerli: https://goerlifaucet.com/

# Reduce gas price in hardhat.config.js
gasPrice: 10000000000  # 10 gwei
```

### Issue: Transaction reverted

**Symptoms:**

```
Error: Transaction reverted without a reason string
```

**Solution:**

```bash
# Check contract requirements and validations
# Add better error messages:
require(condition, "Clear error message");

# Check gas limit
gasLimit: 500000

# Run tests locally first
npx hardhat test
```

### Issue: Contract not verified

**Symptoms:**

```
Error: Contract source code already verified
```

**Solution:**

```bash
# Ensure ETHERSCAN_API_KEY is set
ETHERSCAN_API_KEY=your-key-here

# Wait a few blocks after deployment
# Then verify
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Constructor Args"

# If already verified, skip this step
```

## Database Issues

### Issue: Table doesn't exist

**Symptoms:**

```
psycopg2.errors.UndefinedTable: relation "users" does not exist
```

**Solution:**

```bash
# Initialize database
python src/database/init_db.py

# Or use migrations
flask db upgrade

# Check tables exist
psql -d blockguardian -c "\dt"
```

### Issue: Database locked (SQLite)

**Symptoms:**

```
sqlite3.OperationalError: database is locked
```

**Solution:**

```bash
# Close all connections to database
# Kill any hanging processes
ps aux | grep python

# Use PostgreSQL for production instead
DATABASE_URL=postgresql://user:pass@localhost/blockguardian
```

### Issue: Connection pool exhausted

**Symptoms:**

```
sqlalchemy.exc.TimeoutError: QueuePool limit exceeded
```

**Solution:**

```bash
# Increase pool size in config.py
DATABASE_POOL_SIZE=30
DATABASE_MAX_OVERFLOW=40

# Or close connections properly
session.close()

# Use context managers
with db_manager.get_session() as session:
    # operations
    pass  # session auto-closes
```

## Docker Issues

### Issue: Container exits immediately

**Symptoms:**

```
Container blockguardian_backend exited with code 1
```

**Solution:**

```bash
# Check container logs
docker logs blockguardian_backend

# Run interactively to debug
docker run -it blockguardian_backend /bin/bash

# Check Dockerfile for errors
# Ensure CMD or ENTRYPOINT is correct
```

### Issue: Docker build fails

**Symptoms:**

```
ERROR [internal] load metadata for docker.io/library/python:3.9
```

**Solution:**

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check internet connection
ping docker.io
```

### Issue: Cannot connect to services

**Symptoms:**

```
Connection refused when connecting from one container to another
```

**Solution:**

```bash
# Use service name, not localhost
# In backend connecting to db:
DATABASE_URL=postgresql://user:pass@db:5432/blockguardian

# Not: localhost:5432

# Ensure services are on same network
# In docker-compose.yml:
networks:
  - blockguardian_net
```

## Network & API Issues

### Issue: API timeout

**Symptoms:**

```
Error: timeout of 30000ms exceeded
```

**Solution:**

```bash
# Increase timeout in API client
axios.defaults.timeout = 60000;  # 60 seconds

# Check backend is responding
curl http://localhost:5000/health

# Check network latency
ping api.example.com
```

### Issue: Rate limit exceeded

**Symptoms:**

```
{
  "error": "Rate Limit Exceeded",
  "status_code": 429
}
```

**Solution:**

```bash
# Wait for rate limit reset
# Check X-RateLimit-Reset header

# Implement exponential backoff
sleep_time = 2 ** attempt  # 2, 4, 8, 16 seconds

# Upgrade account tier for higher limits
# Or distribute requests across multiple API keys
```

### Issue: SSL certificate error

**Symptoms:**

```
SSLError: certificate verify failed
```

**Solution:**

```bash
# Update CA certificates
sudo update-ca-certificates

# For development only (NOT production):
import requests
requests.get(url, verify=False)

# Or set environment variable
export REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
```

## Performance Issues

### Issue: Slow API responses

**Diagnosis:**

```bash
# Enable query logging
DATABASE_ECHO=True

# Profile with time
time curl http://localhost:5000/api/portfolios

# Check database query performance
EXPLAIN ANALYZE SELECT * FROM portfolios;
```

**Solutions:**

- Add database indexes
- Implement caching with Redis
- Use pagination for large datasets
- Optimize N+1 queries with eager loading
- Enable compression for responses

### Issue: High memory usage

**Diagnosis:**

```bash
# Check memory usage
docker stats

# Profile Python memory
pip install memory_profiler
python -m memory_profiler script.py
```

**Solutions:**

- Use database cursors for large datasets
- Implement pagination
- Clear unused objects
- Use generators instead of lists
- Increase Docker memory limits

### Issue: Database slow queries

**Diagnosis:**

```bash
# Enable slow query log in PostgreSQL
ALTER DATABASE blockguardian SET log_min_duration_statement = 1000;

# Check running queries
SELECT pid, query, state, wait_event
FROM pg_stat_activity
WHERE state != 'idle';
```

**Solutions:**

```sql
-- Add indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);

-- Analyze tables
ANALYZE portfolios;

-- Vacuum tables
VACUUM ANALYZE;
```

## Getting More Help

If your issue isn't listed here:

1. **Check logs:**

   ```bash
   # Backend logs
   tail -f code/backend/logs/blockguardian.log

   # Docker logs
   docker-compose logs -f
   ```

2. **Search GitHub Issues:**
   https://github.com/quantsingularity/BlockGuardian/issues

3. **Create a new issue:**
   Use the bug report template with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Relevant logs

4. **Join Discussions:**
   https://github.com/quantsingularity/BlockGuardian/discussions

## Diagnostic Commands

**System Health Check:**

```bash
./scripts/health_check.sh --verbose
```

**Component Status:**

```bash
# Backend
curl http://localhost:5000/health

# Database
psql -d blockguardian -c "SELECT version();"

# Redis
redis-cli ping

# Docker
docker-compose ps
```

**Log Collection:**

```bash
./scripts/log_aggregator.sh > debug_logs.txt
```
