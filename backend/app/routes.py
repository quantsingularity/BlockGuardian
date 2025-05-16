from flask import Blueprint, jsonify, request

# Example: Create a main blueprint
# You can create more blueprints for different parts of the application
main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return jsonify({"message": "Welcome to BlockGuardian Backend API"})

@main_bp.route("/health")
def health_check():
    return jsonify({"status": "healthy"}), 200

# Example of a protected route (you would add authentication logic)
@main_bp.route("/api/data", methods=["GET"])
def get_data():
    # In a real application, you might fetch data from a database
    # or another service based on authenticated user
    sample_data = {
        "user_id": "123",
        "balance": "10.5 BTC",
        "alerts": [
            {"type": "Unusual Transaction", "details": "Transaction of 5 BTC to unknown address"},
            {"type": "Phishing Attempt", "details": "Detected suspicious login from new IP"}
        ]
    }
    return jsonify(sample_data)

@main_bp.route("/api/report_incident", methods=["POST"])
def report_incident():
    if not request.json or not "incident_type" in request.json or not "details" in request.json:
        return jsonify({"error": "Missing incident_type or details"}), 400
    
    incident_type = request.json["incident_type"]
    details = request.json["details"]
    
    # Here you would typically log the incident, notify admins, etc.
    print(f"Incident Reported: {incident_type} - {details}")
    
    return jsonify({"message": "Incident reported successfully"}), 201

# You need to register this blueprint in your app factory (app/__init__.py)
# Example in app/__init__.py:
# from .routes import main_bp
# app.register_blueprint(main_bp)

