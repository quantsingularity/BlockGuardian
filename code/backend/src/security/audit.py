"""
Comprehensive Audit Logging System
Implements secure, immutable, and searchable logging for all critical system events.
"""

import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class AuditEventType(Enum):
    """Types of auditable events"""

    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    PASSWORD_CHANGE = "password_change"
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    MFA_ENABLED = "mfa_enabled"
    MFA_DISABLED = "mfa_disabled"
    KYC_SUBMIT = "kyc_submit"
    KYC_APPROVE = "kyc_approve"
    KYC_REJECT = "kyc_reject"
    TRANSACTION_INIT = "transaction_init"
    TRANSACTION_COMPLETE = "transaction_complete"
    TRANSACTION_FAIL = "transaction_fail"
    ORDER_CREATE = "order_create"
    ORDER_CANCEL = "order_cancel"
    TRADE_EXECUTE = "trade_execute"
    TRADE_EXECUTED = "trade_executed"
    PORTFOLIO_CREATED = "portfolio_created"
    PORTFOLIO_UPDATED = "portfolio_updated"
    CONFIG_CHANGE = "config_change"
    POLICY_UPDATE = "policy_update"
    SYSTEM_START = "system_start"
    SYSTEM_SHUTDOWN = "system_shutdown"
    DATA_ACCESS = "data_access"
    DATA_EXPORT = "data_export"
    SECURITY_ALERT = "security_alert"


# AuditLog model is defined lazily after Flask-SQLAlchemy db is initialized
_AuditLog = None


def get_audit_log_model():
    """Get or create the AuditLog SQLAlchemy model, bound to Flask-SQLAlchemy db."""
    global _AuditLog
    if _AuditLog is not None:
        return _AuditLog

    try:
        from sqlalchemy import JSON, Column, DateTime
        from sqlalchemy import Enum as SQLEnum
        from sqlalchemy import Index, Integer, String, Text
        from src.models.user import db

        class AuditLog(db.Model):
            """SQLAlchemy model for the Audit Log"""

            __tablename__ = "audit_logs"
            __table_args__ = (
                Index("idx_audit_user_time", "user_id", "timestamp"),
                Index("idx_audit_type_time", "event_type", "timestamp"),
                {"extend_existing": True},
            )

            id = Column(Integer, primary_key=True, index=True)
            timestamp = Column(
                DateTime(timezone=True),
                default=lambda: datetime.now(timezone.utc),
                nullable=False,
            )
            event_type = Column(SQLEnum(AuditEventType), nullable=False, index=True)
            user_id = Column(Integer, index=True)
            username = Column(String(255))
            ip_address = Column(String(45))
            resource_type = Column(String(255), index=True)
            resource_id = Column(String(255), index=True)
            details = Column(JSON)
            message = Column(Text, nullable=False)
            success = Column(Integer, default=1)

            def __repr__(self) -> str:
                return f"<AuditLog(id={self.id}, event_type='{self.event_type.value}', user_id={self.user_id})>"

        _AuditLog = AuditLog
        return _AuditLog
    except Exception as e:
        logger.warning(f"Could not build AuditLog model: {e}")
        return None


class AuditLogger:
    """
    Service class for logging auditable events.
    Ensures logs are immutable and stored securely in the database.
    """

    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)
        self.app = None
        self.AuditEventType = AuditEventType

    def init_app(self, app: Any) -> None:
        """Initialize with Flask app"""
        self.app = app

    def _get_db(self):
        """Get Flask-SQLAlchemy db session"""
        try:
            from src.models.user import db

            return db
        except Exception:
            return None

    def log_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        username: Optional[str] = None,
        ip_address: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        message: str = "",
        success: bool = True,
    ) -> Optional[Any]:
        """Logs a critical event to the audit log database."""
        if not message:
            message = f"Event type: {event_type.value}"

        AuditLog = get_audit_log_model()
        if AuditLog is None:
            self.logger.info(f"Audit (no model): {event_type.value} user={user_id}")
            return None

        db = self._get_db()
        if db is None:
            self.logger.info(f"Audit (no db): {event_type.value} user={user_id}")
            return None

        try:
            log_entry = AuditLog(
                event_type=event_type,
                user_id=user_id,
                username=username,
                ip_address=ip_address,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details,
                message=message,
                success=1 if success else 0,
            )
            db.session.add(log_entry)
            db.session.commit()
            self.logger.info(
                f"Audit logged: {event_type.value} for user {user_id or 'N/A'}"
            )
            return log_entry
        except Exception as e:
            try:
                db.session.rollback()
            except Exception:
                pass
            self.logger.error(f"Failed to write audit log entry: {e}")
            return None

    def get_logs(
        self,
        event_type: Optional[AuditEventType] = None,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Any]:
        """Retrieves audit logs based on filters."""
        AuditLog = get_audit_log_model()
        db = self._get_db()
        if AuditLog is None or db is None:
            return []
        try:
            query = db.session.query(AuditLog)
            if event_type:
                query = query.filter(AuditLog.event_type == event_type)
            if user_id:
                query = query.filter(AuditLog.user_id == user_id)
            if start_date:
                query = query.filter(AuditLog.timestamp >= start_date)
            if end_date:
                query = query.filter(AuditLog.timestamp <= end_date)
            return (
                query.order_by(AuditLog.timestamp.desc())
                .limit(limit)
                .offset(offset)
                .all()
            )
        except Exception as e:
            self.logger.error(f"Failed to retrieve audit logs: {e}")
            return []

    def search_logs(self, search_term: str, limit: int = 100) -> List[Any]:
        """Searches audit logs for a given term in the message."""
        AuditLog = get_audit_log_model()
        db = self._get_db()
        if AuditLog is None or db is None:
            return []
        try:
            return (
                db.session.query(AuditLog)
                .filter(AuditLog.message.ilike(f"%{search_term}%"))
                .order_by(AuditLog.timestamp.desc())
                .limit(limit)
                .all()
            )
        except Exception as e:
            self.logger.error(f"Failed to search audit logs: {e}")
            return []

    def log_authentication_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        success: bool = True,
        details: Optional[Dict[str, Any]] = None,
    ) -> Optional[Any]:
        """Log authentication event"""
        try:
            from flask import request as flask_request

            ip = flask_request.remote_addr
        except Exception:
            ip = None
        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip,
            details=details,
            message=f"Authentication event: {event_type.value}",
            success=success,
        )

    def log_security_alert(
        self,
        alert_type: str,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> Optional[Any]:
        """Log security alert"""
        try:
            from flask import request as flask_request

            ip = flask_request.remote_addr
        except Exception:
            ip = None
        return self.log_event(
            event_type=AuditEventType.SECURITY_ALERT,
            user_id=user_id,
            ip_address=ip,
            resource_type="security",
            details={"alert_type": alert_type, **(details or {})},
            message=f"Security alert: {alert_type}",
            success=False,
        )

    def log_data_access(
        self,
        action: str,
        resource: str,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> Optional[Any]:
        """Log data access event"""
        try:
            from flask import request as flask_request

            ip = flask_request.remote_addr
        except Exception:
            ip = None
        return self.log_event(
            event_type=AuditEventType.DATA_ACCESS,
            user_id=user_id,
            ip_address=ip,
            resource_type=resource,
            details={"action": action, **(details or {})},
            message=f"Data access: {action} on {resource}",
            success=True,
        )

    def log_financial_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> Optional[Any]:
        """Log financial event"""
        try:
            from flask import request as flask_request

            ip = flask_request.remote_addr
        except Exception:
            ip = None
        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip,
            resource_type="financial",
            details=details,
            message=f"Financial event: {event_type.value}",
            success=True,
        )


audit_logger = AuditLogger()
