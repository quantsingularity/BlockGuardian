# BlockGuardian Backend - Production-Ready Financial Services Platform

## Overview

BlockGuardian Backend is an enterprise-grade financial services platform built with Flask, designed to meet the highest standards of security, compliance, and scalability required in the financial industry. This production-ready backend provides comprehensive features for portfolio management, asset trading, fraud detection, and regulatory compliance.

## 🚀 Key Features

### Security & Authentication
- **Multi-Factor Authentication (MFA)** with TOTP support
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Advanced password policies** and account lockout protection
- **Rate limiting** and DDoS protection
- **Data encryption** at rest and in transit
- **Comprehensive audit logging** for compliance

### Financial Services
- **Portfolio Management** with real-time valuation
- **Asset Trading** (stocks, cryptocurrencies, ETFs, commodities)
- **Transaction Processing** with settlement tracking
- **Risk Assessment** and portfolio analytics
- **Performance Monitoring** and reporting

### AI/ML Capabilities
- **Fraud Detection** using machine learning models
- **Risk Assessment** algorithms
- **Market Prediction** models
- **Anomaly Detection** for suspicious activities
- **Automated Compliance Monitoring**

### Compliance & Regulatory
- **KYC/AML** compliance workflows
- **Suspicious Activity Reporting** (SAR)
- **Large Transaction Reporting** (CTR)
- **Regulatory Filing** automation
- **Audit Trail** maintenance
- **Data Privacy** (GDPR/CCPA compliance)

### Monitoring & Operations
- **Real-time Monitoring** with Prometheus metrics
- **Health Checks** and alerting
- **Performance Tracking** and optimization
- **Comprehensive Logging** with structured logs
- **Error Tracking** and debugging

## 🏗️ Architecture

### Technology Stack
- **Framework**: Flask 3.1.1 with production extensions
- **Database**: SQLAlchemy with PostgreSQL/SQLite support
- **Authentication**: JWT with Flask-JWT-Extended
- **Caching**: Redis for session management and caching
- **Security**: bcrypt, cryptography, rate limiting
- **AI/ML**: TensorFlow, PyTorch, scikit-learn
- **Monitoring**: Prometheus, structured logging
- **Testing**: pytest with comprehensive test coverage

### Project Structure
```
blockguardian_backend/
├── src/
│   ├── main.py                 # Application factory and main entry point
│   ├── config.py              # Configuration management
│   ├── models/                # Database models
│   │   ├── base.py           # Base model classes
│   │   ├── user.py           # User and authentication models
│   │   ├── portfolio.py      # Portfolio and trading models
│   │   └── ai_models.py      # AI/ML model tracking
│   ├── routes/               # API endpoints
│   │   ├── auth.py          # Authentication routes
│   │   └── portfolio.py     # Portfolio management routes
│   ├── security/            # Security components
│   │   ├── auth.py         # Authentication manager
│   │   ├── encryption.py   # Data encryption
│   │   ├── audit.py        # Audit logging
│   │   ├── rate_limiting.py # Rate limiting
│   │   └── validation.py   # Input validation
│   ├── monitoring/          # Monitoring and metrics
│   │   └── metrics.py      # Performance monitoring
│   ├── compliance/          # Compliance and regulatory
│   │   └── reporting.py    # Compliance reporting
│   └── database/           # Database management
│       └── init_db.py     # Database initialization
├── tests/                  # Comprehensive test suite
│   ├── test_auth.py       # Authentication tests
│   └── test_portfolio.py  # Portfolio management tests
├── requirements.txt        # Production dependencies
├── Dockerfile             # Container configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 13+ (or SQLite for development)
- Redis 6+ (optional, for caching and rate limiting)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blockguardian_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python src/database/init_db.py
   ```

6. **Run the application**
   ```bash
   python src/main.py
   ```

The application will be available at `http://localhost:5000`

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Application Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost/blockguardian
# Or for SQLite: sqlite:///./database/app.db

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# Security Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# Email Configuration (for notifications)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# External API Keys
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
FINNHUB_API_KEY=your-finnhub-key

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_PORT=9090
```

## 🐳 Docker Deployment

### Build and run with Docker

1. **Build the image**
   ```bash
   docker build -t blockguardian-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL=postgresql://user:password@host/db \
     -e SECRET_KEY=your-secret-key \
     blockguardian-backend
   ```

### Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/blockguardian
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=your-secret-key
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=blockguardian
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## 🔧 Production Deployment

### Using Gunicorn

1. **Install Gunicorn** (included in requirements.txt)

2. **Create Gunicorn configuration** (`gunicorn.conf.py`):
   ```python
   bind = "0.0.0.0:5000"
   workers = 4
   worker_class = "gevent"
   worker_connections = 1000
   max_requests = 1000
   max_requests_jitter = 100
   timeout = 30
   keepalive = 2
   preload_app = True
   ```

3. **Run with Gunicorn**:
   ```bash
   gunicorn -c gunicorn.conf.py src.main:app
   ```

### Nginx Configuration

Create `/etc/nginx/sites-available/blockguardian`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

### SSL/TLS Configuration

Use Let's Encrypt for SSL certificates:

```bash
sudo certbot --nginx -d your-domain.com
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Test Categories

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test API endpoints and database interactions
- **Security Tests**: Test authentication, authorization, and security features
- **Performance Tests**: Test system performance under load

## 📊 Monitoring and Observability

### Health Checks

The application provides comprehensive health checks:

- **GET /health**: Overall system health
- **GET /api/info**: API information and status

### Metrics

Prometheus metrics are available at `/metrics` (when enabled):

- Request latency and throughput
- Database connection pool status
- Authentication success/failure rates
- Business metrics (transactions, portfolios, etc.)

### Logging

Structured logging with different levels:

- **DEBUG**: Detailed debugging information
- **INFO**: General operational messages
- **WARNING**: Warning conditions
- **ERROR**: Error conditions
- **CRITICAL**: Critical system failures

Logs are written to:
- Console (development)
- Files (`logs/blockguardian.log`)
- External systems (Sentry, ELK stack)

## 🔒 Security Considerations

### Authentication & Authorization

- JWT tokens with configurable expiration
- Refresh token rotation
- Multi-factor authentication (TOTP)
- Role-based access control
- Account lockout after failed attempts

### Data Protection

- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- PII data anonymization
- Secure session management
- CSRF protection

### API Security

- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

### Compliance

- GDPR/CCPA data privacy compliance
- PCI DSS for payment data
- SOX compliance for financial reporting
- Audit trail for all operations

## 📋 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/setup-mfa` - Setup MFA
- `POST /api/auth/verify-mfa` - Verify MFA token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Portfolio Management

- `GET /api/portfolios` - List user portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/{id}` - Get portfolio details
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio
- `GET /api/portfolios/{id}/holdings` - Get portfolio holdings
- `GET /api/portfolios/{id}/performance` - Get performance metrics

### Trading

- `POST /api/portfolios/{id}/transactions` - Create transaction
- `GET /api/portfolios/{id}/transactions` - Get transaction history
- `POST /api/portfolios/{id}/transactions/{tid}/cancel` - Cancel transaction

### Assets

- `GET /api/portfolios/assets` - List available assets
- `GET /api/portfolios/assets/{id}` - Get asset details

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL configuration
   - Ensure database server is running
   - Verify credentials and permissions

2. **Authentication Issues**
   - Check JWT_SECRET_KEY configuration
   - Verify token expiration settings
   - Check user account status

3. **Performance Issues**
   - Monitor database query performance
   - Check Redis connection for caching
   - Review application logs for bottlenecks

### Debug Mode

Enable debug mode for development:

```bash
export FLASK_ENV=development
export DEBUG=True
python src/main.py
```

### Logging Configuration

Increase log verbosity:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write comprehensive docstrings
- Maintain test coverage above 80%
- Use meaningful commit messages

### Pre-commit Hooks

Install pre-commit hooks:

```bash
pre-commit install
```

This will run:
- Code formatting (black)
- Linting (flake8)
- Type checking (mypy)
- Security scanning

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
