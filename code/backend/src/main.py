"""
BlockGuardian Backend - Production-Ready Financial Services Platform
Enterprise-grade backend with comprehensive security, compliance, and scalability features
"""

import logging
import os
import sys
from datetime import datetime

import redis
from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import configuration
from src.config import current_config, get_config

# Import database
from src.models.base import db_manager
from src.models.user import db

# Import routes
from src.routes.auth import auth_bp
from src.routes.portfolio import portfolio_bp
from src.security.audit import audit_logger

# Import security components
from src.security.auth import auth_manager
from src.security.rate_limiting import rate_limiter


def create_app(config_name=None):
    """Application factory pattern for creating Flask app"""

    # Create Flask application
    app = Flask(
        __name__, static_folder=os.path.join(os.path.dirname(__file__), "static")
    )

    # Load configuration
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    config = get_config(config_name)
    app.config.from_object(config)

    # Override with template database config for compatibility
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize logging
    setup_logging(app)

    # Initialize extensions
    initialize_extensions(app)

    # Register blueprints
    register_blueprints(app)

    # Register error handlers
    register_error_handlers(app)

    # Register middleware
    register_middleware(app)

    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health_check():
        """Health check endpoint for monitoring"""
        try:
            # Check database connection
            session = db_manager.get_session()
            session.execute("SELECT 1")
            session.close()
            db_status = "healthy"
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"

        # Check Redis connection (optional)
        redis_status = "healthy"  # Default to healthy if Redis not configured
        try:
            if hasattr(current_config, "REDIS_URL") and current_config.REDIS_URL:
                redis_client = redis.Redis.from_url(current_config.REDIS_URL)
                redis_client.ping()
        except Exception as e:
            redis_status = f"unhealthy: {str(e)}"

        status = {
            "status": "healthy" if db_status == "healthy" else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": config_name,
            "services": {"database": db_status, "redis": redis_status},
        }

        return jsonify(status), 200 if status["status"] == "healthy" else 503

    # API info endpoint
    @app.route("/api/info", methods=["GET"])
    def api_info():
        """API information endpoint"""
        return (
            jsonify(
                {
                    "name": "BlockGuardian Backend API",
                    "version": "1.0.0",
                    "description": "Enterprise-grade financial services platform",
                    "environment": config_name,
                    "features": [
                        "User Authentication & Authorization",
                        "Multi-Factor Authentication",
                        "Portfolio Management",
                        "Asset Trading",
                        "KYC/AML Compliance",
                        "Audit Logging",
                        "Rate Limiting",
                        "Data Encryption",
                    ],
                    "endpoints": {
                        "auth": "/api/auth",
                        "portfolios": "/api/portfolios",
                        "health": "/health",
                        "docs": "/api/docs",
                    },
                }
            ),
            200,
        )

    # Static file serving (from template)
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
            return "Static folder not configured", 404

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, "index.html")
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, "index.html")
            else:
                return "index.html not found", 404

    app.logger.info(f"BlockGuardian Backend initialized in {config_name} mode")

    return app


def setup_logging(app):
    """Configure application logging"""

    # Set log level based on environment
    if app.config.get("DEBUG"):
        log_level = logging.DEBUG
    else:
        log_level = logging.INFO

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Configure Flask logger
    app.logger.setLevel(log_level)

    # Add file handler for production
    if not app.config.get("DEBUG"):
        import logging.handlers

        # Create logs directory if it doesn't exist
        os.makedirs("logs", exist_ok=True)

        # Rotating file handler
        file_handler = logging.handlers.RotatingFileHandler(
            "logs/blockguardian.log", maxBytes=10485760, backupCount=10  # 10MB
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s %(name)s [%(pathname)s:%(lineno)d]: %(message)s"
            )
        )

        app.logger.addHandler(file_handler)

    app.logger.info("Logging configured successfully")


def initialize_extensions(app):
    """Initialize Flask extensions"""

    # Initialize CORS
    CORS(
        app,
        origins=["*"],  # Allow all origins for development
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
    )

    # Initialize database
    db.init_app(app)
    db_manager.init_app(app)

    # Initialize authentication manager
    auth_manager.init_app(app)

    # Initialize rate limiter (with fallback if Redis not available)
    try:
        rate_limiter.init_app(app)
    except Exception as e:
        app.logger.warning(f"Rate limiter initialization failed: {str(e)}")

    # Initialize audit logger
    try:
        audit_logger.init_app(app)
    except Exception as e:
        app.logger.warning(f"Audit logger initialization failed: {str(e)}")

    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
        except Exception as e:
            app.logger.error(f"Failed to create database tables: {str(e)}")

    app.logger.info("Extensions initialized successfully")


def register_blueprints(app):
    """Register application blueprints"""

    # Register authentication routes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Register portfolio routes
    app.register_blueprint(portfolio_bp, url_prefix="/api/portfolios")

    app.logger.info("Blueprints registered successfully")


def register_error_handlers(app):
    """Register global error handlers"""

    @app.errorhandler(400)
    def bad_request(error):
        """Handle bad request errors"""
        return (
            jsonify(
                {
                    "error": "Bad Request",
                    "message": "The request could not be understood by the server",
                    "status_code": 400,
                }
            ),
            400,
        )

    @app.errorhandler(401)
    def unauthorized(error):
        """Handle unauthorized errors"""
        return (
            jsonify(
                {
                    "error": "Unauthorized",
                    "message": "Authentication is required to access this resource",
                    "status_code": 401,
                }
            ),
            401,
        )

    @app.errorhandler(403)
    def forbidden(error):
        """Handle forbidden errors"""
        return (
            jsonify(
                {
                    "error": "Forbidden",
                    "message": "You do not have permission to access this resource",
                    "status_code": 403,
                }
            ),
            403,
        )

    @app.errorhandler(404)
    def not_found(error):
        """Handle not found errors"""
        return (
            jsonify(
                {
                    "error": "Not Found",
                    "message": "The requested resource was not found",
                    "status_code": 404,
                }
            ),
            404,
        )

    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Handle rate limit exceeded errors"""
        return (
            jsonify(
                {
                    "error": "Rate Limit Exceeded",
                    "message": "Too many requests. Please try again later.",
                    "status_code": 429,
                }
            ),
            429,
        )

    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle internal server errors"""
        app.logger.error(f"Internal server error: {str(error)}")

        return (
            jsonify(
                {
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred",
                    "status_code": 500,
                }
            ),
            500,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle all HTTP exceptions"""
        return (
            jsonify(
                {
                    "error": error.name,
                    "message": error.description,
                    "status_code": error.code,
                }
            ),
            error.code,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors"""
        app.logger.error(f"Unexpected error: {str(error)}", exc_info=True)

        return (
            jsonify(
                {
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred",
                    "status_code": 500,
                }
            ),
            500,
        )

    app.logger.info("Error handlers registered successfully")


def register_middleware(app):
    """Register application middleware"""

    @app.before_request
    def before_request():
        """Execute before each request"""

        # Skip middleware for health check and static files
        if request.endpoint in ["health_check", "serve", "static"]:
            return

        # Log request details
        app.logger.debug(f"Request: {request.method} {request.url}")

        # Set request start time for performance monitoring
        g.request_start_time = datetime.utcnow()

    @app.after_request
    def after_request(response):
        """Execute after each request"""

        # Skip middleware for health check and static files
        if request.endpoint in ["health_check", "serve", "static"]:
            return response

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'"

        # Add API version header
        response.headers["X-API-Version"] = "1.0.0"

        # Log response details
        app.logger.debug(
            f"Response: {response.status_code} for {request.method} {request.url}"
        )

        return response

    @app.teardown_appcontext
    def close_db_session(error):
        """Close database session after request"""
        try:
            db_manager.close_session()
        except Exception as e:
            app.logger.error(f"Error closing database session: {str(e)}")

    app.logger.info("Middleware registered successfully")


# Create application instance
app = create_app()

if __name__ == "__main__":
    # Get configuration
    config_name = os.getenv("FLASK_ENV", "development")

    # Run application
    app.run(
        host="0.0.0.0",  # Allow external connections
        port=5000,
        debug=True,
        threaded=True,
    )
