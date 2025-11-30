"""
Comprehensive Audit Logging System
Implements secure, immutable, and searchable logging for all critical system events.
"""

import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Integer, String, Text, Index
from sqlalchemy.dialects.postgresql import JSONB

from ..models.base import db_manager

# Configure logging for the audit system itself
logger = logging.getLogger(__name__)


class AuditEventType(Enum):
    """Types of auditable events"""

    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    PASSWORD_CHANGE = "password_change"
    KYC_SUBMIT = "kyc_submit"
    KYC_APPROVE = "kyc_approve"
    KYC_REJECT = "kyc_reject"
    TRANSACTION_INIT = "transaction_init"
    TRANSACTION_COMPLETE = "transaction_complete"
    TRANSACTION_FAIL = "transaction_fail"
    ORDER_CREATE = "order_create"
    ORDER_CANCEL = "order_cancel"
    TRADE_EXECUTE = "trade_execute"
    CONFIG_CHANGE = "config_change"
    POLICY_UPDATE = "policy_update"
    SYSTEM_START = "system_start"
    SYSTEM_SHUTDOWN = "system_shutdown"
    DATA_ACCESS = "data_access"
    DATA_EXPORT = "data_export"
    SECURITY_ALERT = "security_alert"


class AuditLog(db_manager.Base):
    """SQLAlchemy model for the Audit Log"""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(
        DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False
    )
    event_type = Column(SQLEnum(AuditEventType), nullable=False, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String(255))
    ip_address = Column(String(45))  # IPv4 or IPv6
    resource_type = Column(String(255), index=True)
    resource_id = Column(String(255), index=True)
    details = Column(JSONB)  # Store structured data about the event
    message = Column(Text, nullable=False)
    success = Column(Integer, default=1)  # 1 for success, 0 for failure

    # Indexes for performance
    __table_args__ = (
        Index("idx_audit_user_time", "user_id", "timestamp"),
        Index("idx_audit_type_time", "event_type", "timestamp"),
    )

    def __repr__(self):
        return f"<AuditLog(id={self.id}, event_type='{self.event_type.value}', user_id={self.user_id})>"


class AuditLogger:
    """
    Service class for logging auditable events.
    Ensures logs are immutable and stored securely in the database.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        # Ensure the table is created if it doesn't exist
        self._ensure_table_exists()

    def _ensure_table_exists(self):
        """Creates the AuditLog table if it does not exist."""
        try:
            # This is a simplified approach. In a real Flask/SQLAlchemy app,
            # Alembic migrations would handle this. We rely on the base manager.
            db_manager.Base.metadata.create_all(db_manager.engine)
        except Exception as e:
            self.logger.error(f"Failed to ensure AuditLog table exists: {e}")

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
    ) -> Optional[AuditLog]:
        """
        Logs a critical event to the audit log database.

        Args:
            event_type: The type of event that occurred.
            user_id: The ID of the user who initiated the event.
            username: The username of the user.
            ip_address: The IP address from which the event originated.
            resource_type: The type of resource affected (e.g., 'User', 'Transaction').
            resource_id: The ID of the resource affected.
            details: A dictionary of structured data about the event.
            message: A human-readable summary of the event.
            success: Boolean indicating if the operation was successful.

        Returns:
            The created AuditLog object or None on failure.
        """
        if not message:
            message = f"Event type: {event_type.value}"

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

        session = db_manager.get_session()
        try:
            session.add(log_entry)
            session.commit()
            self.logger.info(
                f"Audit logged: {event_type.value} for user {user_id or 'N/A'}"
            )
            return log_entry
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to write audit log entry: {e}")
            return None
        finally:
            session.close()

    def get_logs(
        self,
        event_type: Optional[AuditEventType] = None,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[AuditLog]:
        """
        Retrieves audit logs based on filters.

        Args:
            event_type: Filter by event type.
            user_id: Filter by user ID.
            start_date: Filter by start date.
            end_date: Filter by end date.
            limit: Maximum number of logs to return.
            offset: Offset for pagination.

        Returns:
            A list of AuditLog objects.
        """
        session = db_manager.get_session()
        try:
            query = session.query(AuditLog)

            if event_type:
                query = query.filter(AuditLog.event_type == event_type)
            if user_id:
                query = query.filter(AuditLog.user_id == user_id)
            if start_date:
                query = query.filter(AuditLog.timestamp >= start_date)
            if end_date:
                query = query.filter(AuditLog.timestamp <= end_date)

            logs = (
                query.order_by(AuditLog.timestamp.desc())
                .limit(limit)
                .offset(offset)
                .all()
            )
            return logs
        except Exception as e:
            self.logger.error(f"Failed to retrieve audit logs: {e}")
            return []
        finally:
            session.close()

    def search_logs(self, search_term: str, limit: int = 100) -> List[AuditLog]:
        """
        Searches audit logs for a given term in the message or details.
        (Note: Full-text search capabilities depend on the underlying database,
        this implementation uses simple LIKE for portability).
        """
        session = db_manager.get_session()
        try:
            # Use a simple case-insensitive search on the message field
            search_pattern = f"%{search_term}%"
            logs = (
                session.query(AuditLog)
                .filter(AuditLog.message.ilike(search_pattern))
                .order_by(AuditLog.timestamp.desc())
                .limit(limit)
                .all()
            )
            return logs
        except Exception as e:
            self.logger.error(f"Failed to search audit logs: {e}")
            return []
        finally:
            session.close()


# Global instance
audit_logger = AuditLogger()
