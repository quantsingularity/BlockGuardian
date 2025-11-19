"""
AI/ML models for fraud detection, risk assessment, and market analysis
Implements enterprise-grade machine learning capabilities for financial services
"""

import enum
import json
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from src.models.base import AuditMixin, Base, TimestampMixin


class ModelType(enum.Enum):
    """Types of AI/ML models"""

    FRAUD_DETECTION = "fraud_detection"
    RISK_ASSESSMENT = "risk_assessment"
    MARKET_PREDICTION = "market_prediction"
    PORTFOLIO_OPTIMIZATION = "portfolio_optimization"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    ANOMALY_DETECTION = "anomaly_detection"


class ModelStatus(enum.Enum):
    """Model deployment status"""

    TRAINING = "training"
    TESTING = "testing"
    DEPLOYED = "deployed"
    DEPRECATED = "deprecated"
    FAILED = "failed"


class PredictionConfidence(enum.Enum):
    """Prediction confidence levels"""

    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class RiskLevel(enum.Enum):
    """Risk assessment levels"""

    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"


class AIModel(Base, AuditMixin, TimestampMixin):
    """AI/ML model registry and metadata"""

    __tablename__ = "ai_models"

    # Model identification
    name = Column(String(255), nullable=False)
    model_type = Column(Enum(ModelType), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    description = Column(Text)

    # Model status and deployment
    status = Column(Enum(ModelStatus), default=ModelStatus.TRAINING, nullable=False)
    deployed_at = Column(DateTime)
    deprecated_at = Column(DateTime)

    # Model performance metrics
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    auc_score = Column(Float)

    # Model configuration
    hyperparameters = Column(JSON)  # JSON field for model hyperparameters
    feature_columns = Column(JSON)  # List of feature column names
    target_column = Column(String(100))

    # Training information
    training_data_size = Column(Integer)
    training_start_date = Column(DateTime)
    training_end_date = Column(DateTime)
    training_duration_seconds = Column(Integer)

    # Model artifacts
    model_path = Column(String(500))  # Path to serialized model file
    model_checksum = Column(String(64))  # SHA-256 checksum for integrity

    # Relationships
    predictions = relationship(
        "ModelPrediction", back_populates="model", lazy="dynamic"
    )

    def __repr__(self):
        return f"<AIModel {self.name} v{self.version}>"

    def deploy(self):
        """Deploy the model to production"""
        if self.status != ModelStatus.TESTING:
            raise ValueError("Model must be in testing status to deploy")

        self.status = ModelStatus.DEPLOYED
        self.deployed_at = datetime.utcnow()

        # Add audit entry
        self.add_audit_entry(
            "model_deployed",
            {
                "model_name": self.name,
                "version": self.version,
                "deployed_at": self.deployed_at.isoformat(),
            },
        )

    def deprecate(self, reason: str = None):
        """Deprecate the model"""
        self.status = ModelStatus.DEPRECATED
        self.deprecated_at = datetime.utcnow()

        # Add audit entry
        self.add_audit_entry(
            "model_deprecated",
            {
                "model_name": self.name,
                "version": self.version,
                "reason": reason,
                "deprecated_at": self.deprecated_at.isoformat(),
            },
        )

    def get_performance_metrics(self) -> Dict[str, float]:
        """Get model performance metrics"""
        return {
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1_score": self.f1_score,
            "auc_score": self.auc_score,
        }


class ModelPrediction(Base, TimestampMixin):
    """Model prediction results and tracking"""

    __tablename__ = "model_predictions"

    # Model reference
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False, index=True)

    # Prediction metadata
    prediction_id = Column(String(255), unique=True, nullable=False, index=True)
    input_data = Column(JSON, nullable=False)  # Input features used for prediction
    prediction_result = Column(JSON, nullable=False)  # Prediction output
    confidence_score = Column(Float)
    confidence_level = Column(Enum(PredictionConfidence))

    # Context information
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)

    # Prediction timing
    prediction_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    processing_time_ms = Column(Integer)  # Time taken to generate prediction

    # Feedback and validation
    actual_outcome = Column(JSON)  # Actual outcome for model validation
    feedback_provided = Column(Boolean, default=False)
    feedback_timestamp = Column(DateTime)

    # Relationships
    model = relationship("AIModel", back_populates="predictions")

    def __repr__(self):
        return f"<ModelPrediction {self.prediction_id}>"

    def provide_feedback(self, actual_outcome: Dict[str, Any]):
        """Provide feedback on prediction accuracy"""
        self.actual_outcome = actual_outcome
        self.feedback_provided = True
        self.feedback_timestamp = datetime.utcnow()


class FraudDetection(Base, AuditMixin, TimestampMixin):
    """Fraud detection results and alerts"""

    __tablename__ = "fraud_detections"

    # Detection metadata
    detection_id = Column(String(255), unique=True, nullable=False, index=True)
    model_prediction_id = Column(
        Integer, ForeignKey("model_predictions.id"), index=True
    )

    # Target information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), index=True)

    # Fraud assessment
    fraud_score = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(Enum(RiskLevel), nullable=False)
    is_fraud = Column(Boolean, nullable=False)

    # Detection details
    fraud_indicators = Column(JSON)  # List of fraud indicators detected
    risk_factors = Column(JSON)  # Risk factors contributing to score

    # Actions taken
    action_taken = Column(String(100))  # block, flag, monitor, approve
    action_timestamp = Column(DateTime)
    action_reason = Column(Text)

    # Investigation status
    investigation_status = Column(
        String(50), default="pending"
    )  # pending, investigating, resolved
    investigator_id = Column(Integer, ForeignKey("users.id"))
    investigation_notes = Column(Text)
    resolution_date = Column(DateTime)

    # False positive tracking
    is_false_positive = Column(Boolean)
    false_positive_reported_at = Column(DateTime)
    false_positive_reason = Column(Text)

    def __repr__(self):
        return f"<FraudDetection {self.detection_id} - Score: {self.fraud_score}>"

    def take_action(self, action: str, reason: str = None, user_id: int = None):
        """Take action based on fraud detection"""
        self.action_taken = action
        self.action_timestamp = datetime.utcnow()
        self.action_reason = reason

        # Add audit entry
        self.add_audit_entry(
            "fraud_action_taken",
            {
                "detection_id": self.detection_id,
                "action": action,
                "reason": reason,
                "taken_by": user_id,
            },
        )

    def mark_false_positive(self, reason: str, reported_by: int = None):
        """Mark detection as false positive"""
        self.is_false_positive = True
        self.false_positive_reported_at = datetime.utcnow()
        self.false_positive_reason = reason

        # Add audit entry
        self.add_audit_entry(
            "marked_false_positive",
            {
                "detection_id": self.detection_id,
                "reason": reason,
                "reported_by": reported_by,
            },
        )


class RiskAssessment(Base, AuditMixin, TimestampMixin):
    """Risk assessment results for users and portfolios"""

    __tablename__ = "risk_assessments"

    # Assessment metadata
    assessment_id = Column(String(255), unique=True, nullable=False, index=True)
    model_prediction_id = Column(
        Integer, ForeignKey("model_predictions.id"), index=True
    )

    # Target information
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)

    # Risk scores
    overall_risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_level = Column(Enum(RiskLevel), nullable=False)

    # Risk breakdown
    credit_risk_score = Column(Float)
    market_risk_score = Column(Float)
    liquidity_risk_score = Column(Float)
    operational_risk_score = Column(Float)

    # Risk factors
    risk_factors = Column(JSON)  # Detailed risk factor analysis
    risk_mitigation_suggestions = Column(JSON)  # Suggested risk mitigation actions

    # Assessment validity
    assessment_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    valid_until = Column(DateTime)
    is_current = Column(Boolean, default=True)

    # Compliance flags
    requires_manual_review = Column(Boolean, default=False)
    compliance_flags = Column(JSON)  # Compliance issues identified

    def __repr__(self):
        return f"<RiskAssessment {self.assessment_id} - Level: {self.risk_level.value}>"

    def expire(self):
        """Mark assessment as expired"""
        self.is_current = False

        # Add audit entry
        self.add_audit_entry(
            "assessment_expired",
            {
                "assessment_id": self.assessment_id,
                "expired_at": datetime.utcnow().isoformat(),
            },
        )


class MarketPrediction(Base, TimestampMixin):
    """Market prediction and analysis results"""

    __tablename__ = "market_predictions"

    # Prediction metadata
    prediction_id = Column(String(255), unique=True, nullable=False, index=True)
    model_prediction_id = Column(
        Integer, ForeignKey("model_predictions.id"), index=True
    )

    # Asset information
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)

    # Prediction details
    prediction_type = Column(String(50), nullable=False)  # price, trend, volatility
    prediction_horizon = Column(String(20), nullable=False)  # 1d, 1w, 1m, 3m, 1y

    # Price predictions
    predicted_price = Column(Float)
    current_price = Column(Float)
    price_change_percent = Column(Float)

    # Trend predictions
    trend_direction = Column(String(20))  # bullish, bearish, neutral
    trend_strength = Column(Float)  # 0.0 to 1.0

    # Volatility predictions
    predicted_volatility = Column(Float)
    volatility_percentile = Column(Float)  # Historical percentile

    # Confidence and accuracy
    confidence_score = Column(Float, nullable=False)
    confidence_level = Column(Enum(PredictionConfidence))

    # Prediction validity
    prediction_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    target_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    # Actual outcomes (for validation)
    actual_price = Column(Float)
    actual_trend = Column(String(20))
    actual_volatility = Column(Float)
    prediction_accuracy = Column(Float)  # Calculated after target date

    def __repr__(self):
        return f"<MarketPrediction {self.prediction_id} - {self.prediction_type}>"

    def calculate_accuracy(self):
        """Calculate prediction accuracy after target date"""
        if not self.actual_price or not self.predicted_price:
            return None

        # Calculate percentage error
        error = abs(self.actual_price - self.predicted_price) / self.actual_price
        accuracy = max(0, 1 - error)  # Convert error to accuracy (0-1)

        self.prediction_accuracy = accuracy
        return accuracy


class AnomalyDetection(Base, AuditMixin, TimestampMixin):
    """Anomaly detection results for various system components"""

    __tablename__ = "anomaly_detections"

    # Detection metadata
    detection_id = Column(String(255), unique=True, nullable=False, index=True)
    model_prediction_id = Column(
        Integer, ForeignKey("model_predictions.id"), index=True
    )

    # Anomaly details
    anomaly_type = Column(
        String(100), nullable=False
    )  # transaction, behavior, market, system
    anomaly_score = Column(Float, nullable=False)  # 0.0 to 1.0
    severity_level = Column(Enum(RiskLevel), nullable=False)

    # Context information
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)

    # Anomaly description
    anomaly_description = Column(Text)
    anomaly_indicators = Column(JSON)  # Specific indicators that triggered detection
    baseline_data = Column(JSON)  # Normal baseline for comparison
    anomalous_data = Column(JSON)  # Anomalous data points

    # Detection timing
    detection_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    anomaly_start_time = Column(DateTime)
    anomaly_end_time = Column(DateTime)

    # Response and resolution
    alert_sent = Column(Boolean, default=False)
    alert_timestamp = Column(DateTime)
    response_action = Column(String(100))  # investigate, ignore, escalate, auto_resolve
    resolution_status = Column(
        String(50), default="open"
    )  # open, investigating, resolved, false_positive
    resolution_timestamp = Column(DateTime)
    resolution_notes = Column(Text)

    def __repr__(self):
        return f"<AnomalyDetection {self.detection_id} - {self.anomaly_type}>"

    def send_alert(self):
        """Send alert for anomaly detection"""
        self.alert_sent = True
        self.alert_timestamp = datetime.utcnow()

        # Add audit entry
        self.add_audit_entry(
            "anomaly_alert_sent",
            {
                "detection_id": self.detection_id,
                "anomaly_type": self.anomaly_type,
                "severity": self.severity_level.value,
            },
        )

    def resolve(self, status: str, notes: str = None, resolved_by: int = None):
        """Resolve anomaly detection"""
        self.resolution_status = status
        self.resolution_timestamp = datetime.utcnow()
        self.resolution_notes = notes

        # Add audit entry
        self.add_audit_entry(
            "anomaly_resolved",
            {
                "detection_id": self.detection_id,
                "status": status,
                "resolved_by": resolved_by,
                "notes": notes,
            },
        )


class ModelTrainingJob(Base, AuditMixin, TimestampMixin):
    """Model training job tracking and management"""

    __tablename__ = "model_training_jobs"

    # Job identification
    job_id = Column(String(255), unique=True, nullable=False, index=True)
    model_name = Column(String(255), nullable=False)
    model_type = Column(Enum(ModelType), nullable=False)

    # Job configuration
    training_config = Column(
        JSON, nullable=False
    )  # Training parameters and configuration
    data_source = Column(String(500))  # Path or reference to training data
    data_size = Column(Integer)  # Number of training samples

    # Job status
    status = Column(
        String(50), default="queued", nullable=False
    )  # queued, running, completed, failed
    progress_percent = Column(Float, default=0.0)

    # Timing information
    queued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)

    # Results
    output_model_id = Column(Integer, ForeignKey("ai_models.id"))
    training_metrics = Column(JSON)  # Training performance metrics
    validation_metrics = Column(JSON)  # Validation performance metrics

    # Error handling
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)

    # Resource usage
    cpu_usage_percent = Column(Float)
    memory_usage_mb = Column(Float)
    gpu_usage_percent = Column(Float)

    def __repr__(self):
        return f"<ModelTrainingJob {self.job_id} - {self.status}>"

    def start(self):
        """Mark job as started"""
        self.status = "running"
        self.started_at = datetime.utcnow()

        # Add audit entry
        self.add_audit_entry(
            "training_job_started",
            {
                "job_id": self.job_id,
                "model_name": self.model_name,
                "started_at": self.started_at.isoformat(),
            },
        )

    def complete(self, model_id: int, metrics: Dict[str, Any]):
        """Mark job as completed"""
        self.status = "completed"
        self.completed_at = datetime.utcnow()
        self.duration_seconds = int(
            (self.completed_at - self.started_at).total_seconds()
        )
        self.output_model_id = model_id
        self.training_metrics = metrics

        # Add audit entry
        self.add_audit_entry(
            "training_job_completed",
            {
                "job_id": self.job_id,
                "model_id": model_id,
                "duration_seconds": self.duration_seconds,
                "metrics": metrics,
            },
        )

    def fail(self, error_message: str):
        """Mark job as failed"""
        self.status = "failed"
        self.completed_at = datetime.utcnow()
        self.error_message = error_message

        if self.started_at:
            self.duration_seconds = int(
                (self.completed_at - self.started_at).total_seconds()
            )

        # Add audit entry
        self.add_audit_entry(
            "training_job_failed",
            {
                "job_id": self.job_id,
                "error_message": error_message,
                "retry_count": self.retry_count,
            },
        )

    def can_retry(self) -> bool:
        """Check if job can be retried"""
        return self.retry_count < self.max_retries and self.status == "failed"
