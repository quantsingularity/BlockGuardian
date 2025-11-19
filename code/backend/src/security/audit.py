"""
Enterprise audit logging system for compliance and security monitoring
Implements comprehensive audit trails, compliance reporting, and security event tracking
"""

import hashlib
import json
import queue
import threading
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional

from flask import current_app, g, request
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from src.config import current_config


class AuditEventType(Enum):
    """Types of audit events"""

    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    MFA_ENABLED = "mfa_enabled"
    MFA_DISABLED = "mfa_disabled"

    # Authorization events
    ACCESS_GRANTED = "access_granted"
    ACCESS_DENIED = "access_denied"
    PERMISSION_CHANGE = "permission_change"
    ROLE_CHANGE = "role_change"

    # Data access events
    DATA_READ = "data_read"
    DATA_CREATE = "data_create"
    DATA_UPDATE = "data_update"
    DATA_DELETE = "data_delete"
    DATA_EXPORT = "data_export"

    # Financial events
    TRADE_EXECUTED = "trade_executed"
    TRADE_CANCELLED = "trade_cancelled"
    PORTFOLIO_CREATED = "portfolio_created"
    PORTFOLIO_UPDATED = "portfolio_updated"
    PORTFOLIO_DELETED = "portfolio_deleted"

    # Blockchain events
    CONTRACT_DEPLOYED = "contract_deployed"
    TRANSACTION_SENT = "transaction_sent"
    TRANSACTION_CONFIRMED = "transaction_confirmed"

    # System events
    SYSTEM_ERROR = "system_error"
    SECURITY_ALERT = "security_alert"
    CONFIGURATION_CHANGE = "configuration_change"

    # Compliance events
    KYC_VERIFICATION = "kyc_verification"
    AML_CHECK = "aml_check"
    COMPLIANCE_REPORT_GENERATED = "compliance_report_generated"


class AuditSeverity(Enum):
    """Audit event severity levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Audit log database model
AuditBase = declarative_base()


class AuditLog(AuditBase):
    """Audit log database model"""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    event_id = Column(String(64), unique=True, nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    user_id = Column(Integer, index=True)
    session_id = Column(String(64), index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    resource = Column(String(255), index=True)
    action = Column(String(100))
    details = Column(Text)
    metadata = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    checksum = Column(String(64), nullable=False)

    # Indexes for performance
    __table_args__ = (
        Index("idx_audit_user_time", "user_id", "timestamp"),
        Index("idx_audit_type_time", "event_type", "timestamp"),
        Index("idx_audit_severity_time", "severity", "timestamp"),
    )


class AuditLogger:
    """Enterprise audit logging system"""

    def __init__(self, app=None):
        self.app = app
        self.engine = None
        self.session_factory = None
        self.log_queue = queue.Queue()
        self.worker_thread = None
        self.running = False

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """Initialize audit logger with Flask app"""
        self.app = app

        # Create separate database connection for audit logs
        audit_db_uri = current_config.database.uri.replace(
            "/blockguardian", "/blockguardian_audit"
        )

        self.engine = create_engine(
            audit_db_uri,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=3600,
        )

        # Create tables
        AuditBase.metadata.create_all(self.engine)

        # Create session factory
        self.session_factory = sessionmaker(bind=self.engine)

        # Start background worker thread
        self.running = True
        self.worker_thread = threading.Thread(target=self._worker, daemon=True)
        self.worker_thread.start()

        app.logger.info("Audit logging system initialized")

    def log_event(
        self,
        event_type: AuditEventType,
        severity: AuditSeverity = AuditSeverity.MEDIUM,
        user_id: Optional[int] = None,
        resource: Optional[str] = None,
        action: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """
        Log an audit event

        Args:
            event_type: Type of audit event
            severity: Event severity level
            user_id: User ID (if applicable)
            resource: Resource being accessed
            action: Action being performed
            details: Event details
            metadata: Additional metadata
        """
        try:
            # Get request context information
            ip_address = None
            user_agent = None
            session_id = None

            if request:
                ip_address = request.remote_addr
                user_agent = request.headers.get("User-Agent", "")
                session_id = request.headers.get("X-Session-ID")

            # Get user ID from Flask g if not provided
            if user_id is None and hasattr(g, "current_user_id"):
                user_id = g.current_user_id

            # Generate unique event ID
            event_id = self._generate_event_id()

            # Prepare audit record
            audit_record = {
                "event_id": event_id,
                "event_type": event_type.value,
                "severity": severity.value,
                "user_id": user_id,
                "session_id": session_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "resource": resource,
                "action": action,
                "details": json.dumps(details) if details else None,
                "metadata": json.dumps(metadata) if metadata else None,
                "timestamp": datetime.utcnow(),
            }

            # Generate checksum for integrity
            audit_record["checksum"] = self._generate_checksum(audit_record)

            # Add to queue for background processing
            self.log_queue.put(audit_record)

        except Exception as e:
            # Log to application logger if audit logging fails
            current_app.logger.error(f"Audit logging failed: {e}")

    def log_authentication_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        success: bool = True,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Log authentication-related events"""
        severity = AuditSeverity.MEDIUM if success else AuditSeverity.HIGH

        self.log_event(
            event_type=event_type,
            severity=severity,
            user_id=user_id,
            resource="authentication",
            action=event_type.value,
            details=details,
        )

    def log_data_access(
        self,
        action: str,
        resource: str,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Log data access events"""
        event_type_map = {
            "read": AuditEventType.DATA_READ,
            "create": AuditEventType.DATA_CREATE,
            "update": AuditEventType.DATA_UPDATE,
            "delete": AuditEventType.DATA_DELETE,
            "export": AuditEventType.DATA_EXPORT,
        }

        event_type = event_type_map.get(action.lower(), AuditEventType.DATA_READ)
        severity = (
            AuditSeverity.HIGH
            if action.lower() in ["delete", "export"]
            else AuditSeverity.MEDIUM
        )

        self.log_event(
            event_type=event_type,
            severity=severity,
            user_id=user_id,
            resource=resource,
            action=action,
            details=details,
        )

    def log_financial_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Log financial transaction events"""
        self.log_event(
            event_type=event_type,
            severity=AuditSeverity.HIGH,
            user_id=user_id,
            resource="financial",
            action=event_type.value,
            details=details,
        )

    def log_security_alert(
        self,
        alert_type: str,
        details: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None,
    ):
        """Log security alerts"""
        self.log_event(
            event_type=AuditEventType.SECURITY_ALERT,
            severity=AuditSeverity.CRITICAL,
            user_id=user_id,
            resource="security",
            action=alert_type,
            details=details,
        )

    def get_audit_logs(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[int] = None,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 1000,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve audit logs with filtering

        Args:
            start_date: Start date for filtering
            end_date: End date for filtering
            user_id: Filter by user ID
            event_type: Filter by event type
            severity: Filter by severity
            limit: Maximum number of records
            offset: Offset for pagination

        Returns:
            List of audit log records
        """
        session = self.session_factory()
        try:
            query = session.query(AuditLog)

            # Apply filters
            if start_date:
                query = query.filter(AuditLog.timestamp >= start_date)
            if end_date:
                query = query.filter(AuditLog.timestamp <= end_date)
            if user_id:
                query = query.filter(AuditLog.user_id == user_id)
            if event_type:
                query = query.filter(AuditLog.event_type == event_type)
            if severity:
                query = query.filter(AuditLog.severity == severity)

            # Order by timestamp descending
            query = query.order_by(AuditLog.timestamp.desc())

            # Apply pagination
            query = query.offset(offset).limit(limit)

            # Execute query and convert to dictionaries
            logs = []
            for log in query.all():
                log_dict = {
                    "id": log.id,
                    "event_id": log.event_id,
                    "event_type": log.event_type,
                    "severity": log.severity,
                    "user_id": log.user_id,
                    "session_id": log.session_id,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "resource": log.resource,
                    "action": log.action,
                    "details": json.loads(log.details) if log.details else None,
                    "metadata": json.loads(log.metadata) if log.metadata else None,
                    "timestamp": log.timestamp.isoformat(),
                    "checksum": log.checksum,
                }
                logs.append(log_dict)

            return logs

        finally:
            session.close()

    def verify_log_integrity(self, log_record: Dict[str, Any]) -> bool:
        """Verify the integrity of an audit log record"""
        stored_checksum = log_record.pop("checksum", None)
        calculated_checksum = self._generate_checksum(log_record)
        return stored_checksum == calculated_checksum

    def generate_compliance_report(
        self, start_date: datetime, end_date: datetime, report_type: str = "full"
    ) -> Dict[str, Any]:
        """
        Generate compliance report for audit logs

        Args:
            start_date: Report start date
            end_date: Report end date
            report_type: Type of report (full, summary, security)

        Returns:
            Compliance report data
        """
        session = self.session_factory()
        try:
            # Get logs for the period
            logs = self.get_audit_logs(
                start_date=start_date, end_date=end_date, limit=10000
            )

            # Generate report statistics
            report = {
                "report_type": report_type,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
                "total_events": len(logs),
                "event_types": {},
                "severity_distribution": {},
                "user_activity": {},
                "security_events": [],
                "compliance_violations": [],
            }

            # Analyze logs
            for log in logs:
                # Count event types
                event_type = log["event_type"]
                report["event_types"][event_type] = (
                    report["event_types"].get(event_type, 0) + 1
                )

                # Count severity distribution
                severity = log["severity"]
                report["severity_distribution"][severity] = (
                    report["severity_distribution"].get(severity, 0) + 1
                )

                # Track user activity
                user_id = log["user_id"]
                if user_id:
                    if user_id not in report["user_activity"]:
                        report["user_activity"][user_id] = {
                            "events": 0,
                            "last_activity": None,
                        }
                    report["user_activity"][user_id]["events"] += 1
                    report["user_activity"][user_id]["last_activity"] = log["timestamp"]

                # Identify security events
                if log["severity"] in ["high", "critical"] or "security" in event_type:
                    report["security_events"].append(log)

                # Identify potential compliance violations
                if self._is_compliance_violation(log):
                    report["compliance_violations"].append(log)

            return report

        finally:
            session.close()

    def _worker(self):
        """Background worker thread for processing audit logs"""
        while self.running:
            try:
                # Get audit record from queue (with timeout)
                audit_record = self.log_queue.get(timeout=1)

                # Save to database
                session = self.session_factory()
                try:
                    audit_log = AuditLog(**audit_record)
                    session.add(audit_log)
                    session.commit()
                except Exception as e:
                    session.rollback()
                    current_app.logger.error(f"Failed to save audit log: {e}")
                finally:
                    session.close()

                self.log_queue.task_done()

            except queue.Empty:
                continue
            except Exception as e:
                current_app.logger.error(f"Audit worker error: {e}")

    def _generate_event_id(self) -> str:
        """Generate unique event ID"""
        import uuid

        return str(uuid.uuid4())

    def _generate_checksum(self, record: Dict[str, Any]) -> str:
        """Generate checksum for audit record integrity"""
        # Create a deterministic string representation
        checksum_data = {
            "event_id": record.get("event_id"),
            "event_type": record.get("event_type"),
            "user_id": record.get("user_id"),
            "timestamp": (
                record.get("timestamp").isoformat() if record.get("timestamp") else None
            ),
            "details": record.get("details"),
            "metadata": record.get("metadata"),
        }

        checksum_string = json.dumps(checksum_data, sort_keys=True)
        return hashlib.sha256(checksum_string.encode()).hexdigest()

    def _is_compliance_violation(self, log: Dict[str, Any]) -> bool:
        """Check if log represents a potential compliance violation"""
        # Define compliance violation patterns
        violation_patterns = [
            # Multiple failed login attempts
            log["event_type"] == "login_failure" and log["severity"] == "high",
            # Unauthorized access attempts
            log["event_type"] == "access_denied"
            and log["severity"] in ["high", "critical"],
            # Data export without proper authorization
            log["event_type"] == "data_export"
            and "unauthorized" in str(log.get("details", "")).lower(),
            # System errors during financial operations
            log["event_type"] == "system_error"
            and "financial" in str(log.get("resource", "")).lower(),
        ]

        return any(violation_patterns)

    def shutdown(self):
        """Shutdown audit logger gracefully"""
        self.running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=5)


# Global audit logger instance
audit_logger = AuditLogger()
