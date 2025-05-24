from flask import Flask

def create_app():
    app = Flask(__name__)

    # Load configurations if any (e.g., from config.py or environment variables)
    # app.config.from_object('config.DevelopmentConfig')

    with app.app_context():
        # Import parts of our application
        from . import routes

        # Register Blueprints
        # from .some_blueprint import bp as some_bp
        # app.register_blueprint(some_bp)

        return app

