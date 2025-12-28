# BlockGuardian Backend

Enterprise-grade financial services backend with comprehensive security, compliance, and scalability features.

## Features

- **Authentication & Authorization**: JWT-based auth with multi-factor authentication (MFA)
- **Portfolio Management**: Complete portfolio tracking and management
- **Security**: Enterprise-grade encryption, audit logging, and rate limiting
- **Compliance**: KYC/AML compliance features
- **Database**: SQLAlchemy ORM with PostgreSQL/SQLite support
- **API**: RESTful API with comprehensive error handling

## Quick Start

### Prerequisites

- Python 3.8+
- pip
- Redis (optional, for rate limiting)

### Installation & Running

```bash
# Make the run script executable (if not already)
chmod +x run.sh

# Run the backend
./run.sh
```

The server will start on `http://localhost:5000`

### Manual Installation

If you prefer manual setup:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python src/main.py
```

## API Endpoints

### Health Check

- `GET /health` - System health status

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/setup-mfa` - Setup MFA
- `POST /api/auth/enable-mfa` - Enable MFA
- `POST /api/auth/disable-mfa` - Disable MFA
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Portfolio Management

- `GET /api/portfolios` - List all portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/<id>` - Get portfolio details
- `PUT /api/portfolios/<id>` - Update portfolio
- `DELETE /api/portfolios/<id>` - Delete portfolio
- `POST /api/portfolios/<id>/holdings` - Add holding
- `GET /api/portfolios/<id>/performance` - Get performance metrics

## Configuration

Configuration is managed through environment variables. Copy `.env.example` to `.env` and customize:

```bash
# Application
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/blockguardian
# Or use SQLite for development
# DATABASE_URL=sqlite:///./database/app.db

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# Security
ENCRYPTION_KEY=your-encryption-key-here
JWT_ACCESS_EXPIRES_HOURS=1
JWT_REFRESH_EXPIRES_DAYS=30
```

## Development

### Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration management
│   ├── logging_config.py    # Logging configuration
│   ├── compliance/          # Compliance features
│   ├── database/            # Database initialization
│   ├── models/              # Data models
│   ├── monitoring/          # Monitoring and metrics
│   ├── routes/              # API routes
│   ├── security/            # Security features
│   └── static/              # Static files
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
├── run.sh                   # Startup script
└── README.md               # This file
```

### Running Tests

```bash
source venv/bin/activate
pytest tests/
```

## Security Features

- **Password Hashing**: PBKDF2-SHA256 with salting
- **JWT Authentication**: Secure token-based authentication
- **MFA Support**: TOTP-based multi-factor authentication
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Comprehensive audit trails
- **Field Encryption**: Sensitive data encryption
- **Input Validation**: XSS and SQL injection protection

## Database

The backend uses SQLAlchemy ORM with support for:

- PostgreSQL (recommended for production)
- SQLite (development/testing)

Database tables are automatically created on first run.

## Monitoring

- Health check endpoint at `/health`
- Comprehensive logging to `logs/blockguardian.log`
- Audit logs for security events

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production`
2. Use PostgreSQL database
3. Configure Redis for rate limiting
4. Set strong secret keys
5. Use a production WSGI server (gunicorn recommended)
6. Enable HTTPS
7. Configure CORS properly
8. Set up monitoring and alerting

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "src.main:create_app()"
```

## Troubleshooting

### Import Errors

If you encounter import errors, ensure you're running from the backend directory and the virtual environment is activated.

### Database Errors

Delete the database file and restart to recreate tables:

```bash
rm src/database/app.db
./run.sh
```

### Redis Connection Errors

Redis is optional. The backend will work without it, but rate limiting will be disabled. Install and start Redis if you need rate limiting features.

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.

## License

[Add your license information here]
