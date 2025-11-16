"""
Enhanced Transaction Models for Financial Operations
Implements comprehensive transaction tracking with compliance and audit features
"""

from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
import uuid

from .base import BaseModel, db


class TransactionType(Enum):
    """Transaction type enumeration"""
    BUY = "buy"
    SELL = "sell"
    TRANSFER = "transfer"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    DIVIDEND = "dividend"
    INTEREST = "interest"
    FEE = "fee"
    SPLIT = "split"
    MERGER = "merger"
    SPINOFF = "spinoff"


class TransactionStatus(Enum):
    """Transaction status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    SETTLED = "settled"


class RiskLevel(Enum):
    """Risk level enumeration for compliance"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Transaction(BaseModel):
    """Enhanced transaction model with comprehensive financial features"""
    
    __tablename__ = 'transactions'
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(String(50), unique=True, nullable=False, index=True)
    external_id = Column(String(100), index=True)  # External system reference
    
    # User and portfolio relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey('portfolios.id'), nullable=False, index=True)
    
    # Transaction details
    transaction_type = Column(String(20), nullable=False, index=True)
    status = Column(String(20), nullable=False, default=TransactionStatus.PENDING.value, index=True)
    
    # Asset information
    asset_symbol = Column(String(20), nullable=False, index=True)
    asset_name = Column(String(200))
    asset_type = Column(String(50))  # stock, crypto, etf, bond, commodity
    
    # Financial details
    quantity = Column(Numeric(20, 8), nullable=False)
    price = Column(Numeric(20, 8), nullable=False)
    total_amount = Column(Numeric(20, 2), nullable=False)
    fee = Column(Numeric(20, 2), default=Decimal('0.00')) # Use Decimal for default
    tax = Column(Numeric(20, 2), default=Decimal('0.00')) # Use Decimal for default
    net_amount = Column(Numeric(20, 2), nullable=False)
    
    # Currency information
    currency = Column(String(3), nullable=False, default='USD')
    exchange_rate = Column(Numeric(20, 8), default=1)  # To base currency
    
    # Timing information
    order_date = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    execution_date = Column(DateTime(timezone=True))
    settlement_date = Column(DateTime(timezone=True))
    
    # Market information
    market = Column(String(50))  # NYSE, NASDAQ, etc.
    exchange = Column(String(50))
    trading_session = Column(String(20))  # regular, pre-market, after-hours
    
    # Risk and compliance
    risk_level = Column(String(20), default=RiskLevel.LOW.value, index=True)
    compliance_status = Column(String(20), default='pending')
    aml_status = Column(String(20), default='pending')
    kyc_verified = Column(Boolean, default=False)
    
    # Regulatory reporting
    reportable = Column(Boolean, default=False)
    reported_date = Column(DateTime(timezone=True))
    reporting_jurisdiction = Column(String(10))  # US, EU, etc.
    
    # Additional metadata
    metadata = Column(JSONB)  # Flexible storage for additional data
    notes = Column(Text)
    tags = Column(String(500))  # Comma-separated tags
    
    # Audit trail
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    approved_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    cancelled_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="transactions")
    portfolio = relationship("Portfolio", back_populates="transactions")
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    cancelled_by_user = relationship("User", foreign_keys=[cancelled_by])
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_transaction_user_date', 'user_id', 'order_date'),
        Index('idx_transaction_portfolio_date', 'portfolio_id', 'order_date'),
        Index('idx_transaction_asset_date', 'asset_symbol', 'order_date'),
        Index('idx_transaction_status_date', 'status', 'order_date'),
        Index('idx_transaction_risk_compliance', 'risk_level', 'compliance_status'),
        # Constraint: Ensure quantity and total_amount are non-negative
        CheckConstraint('quantity >= 0', name='check_positive_quantity'),
        CheckConstraint('total_amount >= 0', name='check_positive_total_amount'),
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.transaction_id:
            self.transaction_id = self.generate_transaction_id()
    
    @staticmethod
    def generate_transaction_id() -> str:
        """Generate unique transaction ID"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = str(uuid.uuid4())[:8].upper()
        return f"TXN-{timestamp}-{random_suffix}"
    
    @hybrid_property
    def is_buy_order(self) -> bool:
        """Check if transaction is a buy order"""
        return self.transaction_type == TransactionType.BUY.value
    
    @hybrid_property
    def is_sell_order(self) -> bool:
        """Check if transaction is a sell order"""
        return self.transaction_type == TransactionType.SELL.value
    
    @hybrid_property
    def is_completed(self) -> bool:
        """Check if transaction is completed"""
        return self.status == TransactionStatus.COMPLETED.value
    
    @hybrid_property
    def is_pending(self) -> bool:
        """Check if transaction is pending"""
        return self.status == TransactionStatus.PENDING.value
    
    @hybrid_property
    def requires_compliance_review(self) -> bool:
        """Check if transaction requires compliance review"""
        return (
            self.risk_level in [RiskLevel.HIGH.value, RiskLevel.CRITICAL.value] or
            self.total_amount > 10000 or  # Large transaction threshold
            self.compliance_status == 'pending'
        )
    
    def calculate_total_cost(self) -> Decimal:
        """Calculate total cost including fees and taxes"""
        return self.total_amount + self.fee + self.tax
    
    def calculate_net_proceeds(self) -> Decimal:
        """Calculate net proceeds after fees and taxes"""
        return self.total_amount - self.fee - self.tax
    
    def update_status(self, new_status: TransactionStatus, user_id: Optional[str] = None):
        """Update transaction status with audit trail"""
        old_status = self.status
        self.status = new_status.value
        self.updated_at = datetime.now(timezone.utc)
        
        if new_status == TransactionStatus.COMPLETED:
            self.execution_date = datetime.now(timezone.utc)
        elif new_status == TransactionStatus.SETTLED:
            self.settlement_date = datetime.now(timezone.utc)
        
        # Log status change
        if not self.metadata:
            self.metadata = {}
        
        if 'status_history' not in self.metadata:
            self.metadata['status_history'] = []
        
        self.metadata['status_history'].append({
            'from_status': old_status,
            'to_status': new_status.value,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'changed_by': user_id
        })
    
    def add_compliance_note(self, note: str, user_id: Optional[str] = None):
        """Add compliance note to transaction"""
        if not self.metadata:
            self.metadata = {}
        
        if 'compliance_notes' not in self.metadata:
            self.metadata['compliance_notes'] = []
        
        self.metadata['compliance_notes'].append({
            'note': note,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'added_by': user_id
        })
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert transaction to dictionary"""
        # Removed redundant to_dict method as BaseModel likely provides a similar one,
        # or it should be implemented using a proper serialization library like Marshmallow.
        # Keeping it for now but ensuring Decimal values are converted to float for JSON serialization.
        return {
            'id': str(self.id),
            'transaction_id': self.transaction_id,
            'external_id': self.external_id,
            'user_id': str(self.user_id),
            'portfolio_id': str(self.portfolio_id),
            'transaction_type': self.transaction_type,
            'status': self.status,
            'asset_symbol': self.asset_symbol,
            'asset_name': self.asset_name,
            'asset_type': self.asset_type,
            'quantity': float(self.quantity),
            'price': float(self.price),
            'total_amount': float(self.total_amount),
            'fee': float(self.fee),
            'tax': float(self.tax),
            'net_amount': float(self.net_amount),
            'currency': self.currency,
            'exchange_rate': float(self.exchange_rate),
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'execution_date': self.execution_date.isoformat() if self.execution_date else None,
            'settlement_date': self.settlement_date.isoformat() if self.settlement_date else None,
            'market': self.market,
            'exchange': self.exchange,
            'trading_session': self.trading_session,
            'risk_level': self.risk_level,
            'compliance_status': self.compliance_status,
            'aml_status': self.aml_status,
            'kyc_verified': self.kyc_verified,
            'reportable': self.reportable,
            'reported_date': self.reported_date.isoformat() if self.reported_date else None,
            'reporting_jurisdiction': self.reporting_jurisdiction,
            'metadata': self.metadata,
            'notes': self.notes,
            'tags': self.tags,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TransactionAudit(BaseModel):
    """Transaction audit log for compliance tracking"""
    
    __tablename__ = 'transaction_audits'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey('transactions.id'), nullable=False, index=True)
    
    # Audit details
    action = Column(String(50), nullable=False)  # created, updated, approved, cancelled
    field_changed = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    
    # User and system information
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    session_id = Column(String(100))
    
    # Additional context
    reason = Column(Text)
    metadata = Column(JSONB)
    
    # Relationships
    transaction = relationship("Transaction")
    user = relationship("User")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert audit record to dictionary"""
        return {
            'id': str(self.id),
            'transaction_id': str(self.transaction_id),
            'action': self.action,
            'field_changed': self.field_changed,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'user_id': str(self.user_id) if self.user_id else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'session_id': self.session_id,
            'reason': self.reason,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat()
        }


class SuspiciousActivity(BaseModel):
    """Suspicious activity reporting for AML compliance"""
    
    __tablename__ = 'suspicious_activities'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey('transactions.id'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    # SAR details
    sar_number = Column(String(50), unique=True)
    activity_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    risk_score = Column(Integer, nullable=False)
    
    # Status and reporting
    status = Column(String(20), default='pending')  # pending, investigating, reported, closed
    reported_to_authorities = Column(Boolean, default=False)
    report_date = Column(DateTime(timezone=True))
    
    # Investigation details
    investigated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    investigation_notes = Column(Text)
    resolution = Column(Text)
    
    # Additional information
    metadata = Column(JSONB)
    
    # Relationships
    transaction = relationship("Transaction")
    user = relationship("User", foreign_keys=[user_id])
    investigator = relationship("User", foreign_keys=[investigated_by])
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.sar_number:
            self.sar_number = self.generate_sar_number()
    
    @staticmethod
    def generate_sar_number() -> str:
        """Generate unique SAR number"""
        timestamp = datetime.now().strftime('%Y%m%d')
        random_suffix = str(uuid.uuid4())[:6].upper()
        return f"SAR-{timestamp}-{random_suffix}"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert SAR to dictionary"""
        return {
            'id': str(self.id),
            'transaction_id': str(self.transaction_id),
            'user_id': str(self.user_id),
            'sar_number': self.sar_number,
            'activity_type': self.activity_type,
            'description': self.description,
            'risk_score': self.risk_score,
            'status': self.status,
            'reported_to_authorities': self.reported_to_authorities,
            'report_date': self.report_date.isoformat() if self.report_date else None,
            'investigated_by': str(self.investigated_by) if self.investigated_by else None,
            'investigation_notes': self.investigation_notes,
            'resolution': self.resolution,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

