"""
Portfolio and financial models for BlockGuardian Backend
Implements comprehensive portfolio management, asset tracking, and transaction processing
"""

import enum
import json
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import (Boolean, Column, DateTime, Enum, Float, ForeignKey,
                        Index, Integer, Numeric, String, Text)
from sqlalchemy.orm import relationship
from src.models.base import AuditMixin, Base, EncryptedMixin, TimestampMixin


class AssetType(enum.Enum):
    """Types of financial assets"""

    STOCK = "stock"
    BOND = "bond"
    CRYPTOCURRENCY = "cryptocurrency"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    COMMODITY = "commodity"
    FOREX = "forex"
    DERIVATIVE = "derivative"
    REAL_ESTATE = "real_estate"
    ALTERNATIVE = "alternative"


class TransactionType(enum.Enum):
    """Types of financial transactions"""

    BUY = "buy"
    SELL = "sell"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    DIVIDEND = "dividend"
    INTEREST = "interest"
    FEE = "fee"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    SPLIT = "split"
    MERGER = "merger"


class TransactionStatus(enum.Enum):
    """Transaction processing status"""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class PortfolioType(enum.Enum):
    """Types of portfolios"""

    PERSONAL = "personal"
    RETIREMENT = "retirement"
    BUSINESS = "business"
    TRUST = "trust"
    MANAGED = "managed"


class RiskLevel(enum.Enum):
    """Risk assessment levels"""

    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


class Portfolio(Base, AuditMixin, TimestampMixin):
    """Portfolio model for managing investment portfolios"""

    __tablename__ = "portfolios"

    # Basic portfolio information
    name = Column(String(255), nullable=False)
    description = Column(Text)
    portfolio_type = Column(
        Enum(PortfolioType), default=PortfolioType.PERSONAL, nullable=False
    )

    # Owner information
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Portfolio configuration
    base_currency = Column(String(3), default="USD", nullable=False)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MODERATE, nullable=False)
    investment_objective = Column(Text)

    # Portfolio metrics
    total_value = Column(Numeric(20, 8), default=0, nullable=False)
    cash_balance = Column(Numeric(20, 8), default=0, nullable=False)
    invested_amount = Column(Numeric(20, 8), default=0, nullable=False)
    unrealized_pnl = Column(Numeric(20, 8), default=0, nullable=False)
    realized_pnl = Column(Numeric(20, 8), default=0, nullable=False)

    # Performance tracking
    inception_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_rebalance_date = Column(DateTime)
    performance_benchmark = Column(String(50))  # e.g., "S&P500", "NASDAQ"

    # Risk management
    max_position_size = Column(Float, default=0.1)  # Maximum 10% per position
    max_sector_allocation = Column(Float, default=0.3)  # Maximum 30% per sector
    stop_loss_threshold = Column(Float, default=0.05)  # 5% stop loss

    # Status and settings
    is_active = Column(Boolean, default=True, nullable=False)
    auto_rebalance = Column(Boolean, default=False, nullable=False)
    rebalance_frequency = Column(Integer, default=90)  # Days

    # Relationships
    owner = relationship("User", backref="portfolios")
    holdings = relationship(
        "PortfolioHolding", back_populates="portfolio", lazy="dynamic"
    )
    transactions = relationship(
        "Transaction", back_populates="portfolio", lazy="dynamic"
    )
    performance_snapshots = relationship(
        "PortfolioSnapshot", back_populates="portfolio", lazy="dynamic"
    )

    def __repr__(self):
        return f"<Portfolio {self.name} ({self.owner_id})>"

    def calculate_total_value(self) -> Decimal:
        """Calculate current total portfolio value"""
        total = Decimal("0")

        # Add cash balance
        total += Decimal(str(self.cash_balance))

        # Add value of all holdings
        for holding in self.holdings.filter_by(is_active=True):
            total += holding.current_value

        return total

    def update_portfolio_metrics(self):
        """Update portfolio metrics based on current holdings"""
        self.total_value = self.calculate_total_value()

        # Calculate unrealized P&L
        unrealized_pnl = Decimal("0")
        invested_amount = Decimal("0")

        for holding in self.holdings.filter_by(is_active=True):
            invested_amount += holding.cost_basis
            unrealized_pnl += holding.unrealized_pnl

        self.invested_amount = invested_amount
        self.unrealized_pnl = unrealized_pnl

        # Add audit entry
        self.add_audit_entry(
            "metrics_updated",
            {
                "total_value": float(self.total_value),
                "unrealized_pnl": float(self.unrealized_pnl),
            },
        )

    def get_asset_allocation(self) -> Dict[str, float]:
        """Get current asset allocation by type"""
        allocation = {}
        total_value = float(self.total_value)

        if total_value == 0:
            return allocation

        for holding in self.holdings.filter_by(is_active=True):
            asset_type = holding.asset.asset_type.value
            value = float(holding.current_value)
            percentage = (value / total_value) * 100

            if asset_type in allocation:
                allocation[asset_type] += percentage
            else:
                allocation[asset_type] = percentage

        return allocation

    def check_risk_limits(self) -> List[Dict[str, Any]]:
        """Check if portfolio violates risk limits"""
        violations = []
        total_value = float(self.total_value)

        if total_value == 0:
            return violations

        # Check position size limits
        for holding in self.holdings.filter_by(is_active=True):
            position_percentage = float(holding.current_value) / total_value
            if position_percentage > self.max_position_size:
                violations.append(
                    {
                        "type": "position_size",
                        "asset": holding.asset.symbol,
                        "current": position_percentage,
                        "limit": self.max_position_size,
                    }
                )

        # Check sector allocation limits (simplified - would need sector data)
        asset_allocation = self.get_asset_allocation()
        for asset_type, percentage in asset_allocation.items():
            if percentage > (self.max_sector_allocation * 100):
                violations.append(
                    {
                        "type": "sector_allocation",
                        "sector": asset_type,
                        "current": percentage / 100,
                        "limit": self.max_sector_allocation,
                    }
                )

        return violations

    def create_snapshot(self):
        """Create a performance snapshot"""
        snapshot = PortfolioSnapshot(
            portfolio_id=self.id,
            total_value=self.total_value,
            cash_balance=self.cash_balance,
            invested_amount=self.invested_amount,
            unrealized_pnl=self.unrealized_pnl,
            realized_pnl=self.realized_pnl,
            snapshot_date=datetime.utcnow(),
        )

        # Store asset allocation
        allocation = self.get_asset_allocation()
        snapshot.asset_allocation = json.dumps(allocation)

        return snapshot


class Asset(Base, TimestampMixin):
    """Financial asset model"""

    __tablename__ = "assets"

    # Basic asset information
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False, index=True)

    # Asset details
    description = Column(Text)
    sector = Column(String(100))
    industry = Column(String(100))
    country = Column(String(50))
    currency = Column(String(3), default="USD")

    # Trading information
    exchange = Column(String(50))
    isin = Column(String(12))  # International Securities Identification Number
    cusip = Column(
        String(9)
    )  # Committee on Uniform Securities Identification Procedures

    # Current market data
    current_price = Column(Numeric(20, 8))
    previous_close = Column(Numeric(20, 8))
    day_change = Column(Numeric(20, 8))
    day_change_percent = Column(Float)
    volume = Column(Integer)
    market_cap = Column(Numeric(20, 2))

    # Asset metadata
    is_tradeable = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationships
    holdings = relationship("PortfolioHolding", back_populates="asset", lazy="dynamic")
    price_history = relationship("AssetPrice", back_populates="asset", lazy="dynamic")

    def __repr__(self):
        return f"<Asset {self.symbol}>"

    def update_price(self, new_price: Decimal, volume: int = None):
        """Update asset price and calculate changes"""
        if self.current_price:
            self.previous_close = self.current_price
            self.day_change = new_price - self.current_price
            if self.current_price > 0:
                self.day_change_percent = float(
                    (self.day_change / self.current_price) * 100
                )

        self.current_price = new_price
        if volume:
            self.volume = volume
        self.last_updated = datetime.utcnow()

    def get_price_history(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get price history for specified number of days"""
        start_date = datetime.utcnow() - timedelta(days=days)

        prices = (
            self.price_history.filter(AssetPrice.timestamp >= start_date)
            .order_by(AssetPrice.timestamp.desc())
            .all()
        )

        return [price.to_dict() for price in prices]


class PortfolioHolding(Base, AuditMixin, TimestampMixin):
    """Individual asset holding within a portfolio"""

    __tablename__ = "portfolio_holdings"

    # Relationships
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id"), nullable=False, index=True
    )
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)

    # Position information
    quantity = Column(Numeric(20, 8), nullable=False)
    average_cost = Column(Numeric(20, 8), nullable=False)
    cost_basis = Column(Numeric(20, 8), nullable=False)  # quantity * average_cost

    # Current valuation
    current_price = Column(Numeric(20, 8))
    current_value = Column(Numeric(20, 8))  # quantity * current_price
    unrealized_pnl = Column(Numeric(20, 8))  # current_value - cost_basis
    unrealized_pnl_percent = Column(Float)

    # Position metadata
    first_purchase_date = Column(DateTime, default=datetime.utcnow)
    last_transaction_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")
    asset = relationship("Asset", back_populates="holdings")

    # Indexes for performance
    __table_args__ = (Index("idx_portfolio_asset", "portfolio_id", "asset_id"),)

    def __repr__(self):
        return f"<Holding {self.asset.symbol} in {self.portfolio.name}>"

    def update_valuation(self):
        """Update current valuation based on asset price"""
        if self.asset.current_price:
            self.current_price = self.asset.current_price
            self.current_value = self.quantity * self.current_price
            self.unrealized_pnl = self.current_value - self.cost_basis

            if self.cost_basis > 0:
                self.unrealized_pnl_percent = float(
                    (self.unrealized_pnl / self.cost_basis) * 100
                )

    def add_shares(self, quantity: Decimal, price: Decimal):
        """Add shares to the holding (buy transaction)"""
        total_cost = quantity * price
        new_total_quantity = self.quantity + quantity
        new_total_cost = self.cost_basis + total_cost

        # Update average cost
        self.average_cost = new_total_cost / new_total_quantity
        self.quantity = new_total_quantity
        self.cost_basis = new_total_cost
        self.last_transaction_date = datetime.utcnow()

        # Update valuation
        self.update_valuation()

        # Add audit entry
        self.add_audit_entry(
            "shares_added",
            {
                "quantity": float(quantity),
                "price": float(price),
                "total_cost": float(total_cost),
            },
        )

    def remove_shares(self, quantity: Decimal, price: Decimal) -> Decimal:
        """Remove shares from the holding (sell transaction)"""
        if quantity > self.quantity:
            raise ValueError("Cannot sell more shares than owned")

        # Calculate realized P&L
        cost_per_share = self.cost_basis / self.quantity
        realized_pnl = (price - cost_per_share) * quantity

        # Update holding
        self.quantity -= quantity
        self.cost_basis -= cost_per_share * quantity
        self.last_transaction_date = datetime.utcnow()

        # If no shares left, mark as inactive
        if self.quantity == 0:
            self.is_active = False

        # Update valuation
        self.update_valuation()

        # Add audit entry
        self.add_audit_entry(
            "shares_removed",
            {
                "quantity": float(quantity),
                "price": float(price),
                "realized_pnl": float(realized_pnl),
            },
        )

        return realized_pnl


class Transaction(Base, AuditMixin, EncryptedMixin, TimestampMixin):
    """Financial transaction model"""

    __tablename__ = "transactions"

    # Encrypted fields for sensitive financial data
    _encrypted_fields = ["external_account_number", "routing_number"]

    # Basic transaction information
    transaction_type = Column(Enum(TransactionType), nullable=False, index=True)
    status = Column(
        Enum(TransactionStatus),
        default=TransactionStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), index=True)

    # Transaction amounts
    quantity = Column(Numeric(20, 8))  # For asset transactions
    price = Column(Numeric(20, 8))  # Price per unit
    amount = Column(Numeric(20, 8), nullable=False)  # Total transaction amount
    fee = Column(Numeric(20, 8), default=0)
    net_amount = Column(Numeric(20, 8))  # Amount after fees

    # Currency and exchange
    currency = Column(String(3), default="USD", nullable=False)
    exchange_rate = Column(Numeric(10, 6), default=1)  # For currency conversion

    # External references
    external_transaction_id = Column(String(255), index=True)
    external_account_number = Column(Text)  # Encrypted
    routing_number = Column(Text)  # Encrypted

    # Processing information
    executed_at = Column(DateTime)
    settled_at = Column(DateTime)
    confirmation_number = Column(String(255))

    # Additional metadata
    notes = Column(Text)
    metadata = Column(Text)  # JSON for additional data

    # Relationships
    user = relationship("User", backref="transactions")
    portfolio = relationship("Portfolio", back_populates="transactions")
    asset = relationship("Asset", backref="transactions")

    # Indexes for performance
    __table_args__ = (
        Index("idx_user_date", "user_id", "created_at"),
        Index("idx_portfolio_date", "portfolio_id", "created_at"),
        Index("idx_status_date", "status", "created_at"),
    )

    def __repr__(self):
        return (
            f"<Transaction {self.transaction_type.value} {self.amount} {self.currency}>"
        )

    def execute(self):
        """Execute the transaction"""
        if self.status != TransactionStatus.PENDING:
            raise ValueError("Transaction is not in pending status")

        self.status = TransactionStatus.PROCESSING
        self.executed_at = datetime.utcnow()

        # Calculate net amount
        self.net_amount = self.amount - (self.fee or 0)

        # Add audit entry
        self.add_audit_entry(
            "transaction_executed",
            {
                "type": self.transaction_type.value,
                "amount": float(self.amount),
                "fee": float(self.fee or 0),
            },
        )

    def complete(self, confirmation_number: str = None):
        """Mark transaction as completed"""
        if self.status != TransactionStatus.PROCESSING:
            raise ValueError("Transaction is not in processing status")

        self.status = TransactionStatus.COMPLETED
        self.settled_at = datetime.utcnow()
        if confirmation_number:
            self.confirmation_number = confirmation_number

        # Add audit entry
        self.add_audit_entry(
            "transaction_completed", {"confirmation_number": confirmation_number}
        )

    def fail(self, reason: str):
        """Mark transaction as failed"""
        self.status = TransactionStatus.FAILED

        # Add audit entry
        self.add_audit_entry("transaction_failed", {"reason": reason})

    def cancel(self, reason: str = None):
        """Cancel the transaction"""
        if self.status in [TransactionStatus.COMPLETED, TransactionStatus.FAILED]:
            raise ValueError("Cannot cancel completed or failed transaction")

        self.status = TransactionStatus.CANCELLED

        # Add audit entry
        self.add_audit_entry("transaction_cancelled", {"reason": reason})


class AssetPrice(Base):
    """Historical asset price data"""

    __tablename__ = "asset_prices"

    # Relationships
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)

    # Price data
    open_price = Column(Numeric(20, 8))
    high_price = Column(Numeric(20, 8))
    low_price = Column(Numeric(20, 8))
    close_price = Column(Numeric(20, 8), nullable=False)
    volume = Column(Integer)

    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Data source
    source = Column(String(50))  # e.g., "yahoo", "alpha_vantage", "coinmarketcap"

    # Relationships
    asset = relationship("Asset", back_populates="price_history")

    # Indexes for performance
    __table_args__ = (Index("idx_asset_timestamp", "asset_id", "timestamp"),)

    def __repr__(self):
        return (
            f"<AssetPrice {self.asset.symbol} {self.close_price} at {self.timestamp}>"
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "asset_id": self.asset_id,
            "open_price": float(self.open_price) if self.open_price else None,
            "high_price": float(self.high_price) if self.high_price else None,
            "low_price": float(self.low_price) if self.low_price else None,
            "close_price": float(self.close_price),
            "volume": self.volume,
            "timestamp": self.timestamp.isoformat(),
        }


class PortfolioSnapshot(Base):
    """Portfolio performance snapshots for historical tracking"""

    __tablename__ = "portfolio_snapshots"

    # Relationships
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id"), nullable=False, index=True
    )

    # Snapshot data
    total_value = Column(Numeric(20, 8), nullable=False)
    cash_balance = Column(Numeric(20, 8), nullable=False)
    invested_amount = Column(Numeric(20, 8), nullable=False)
    unrealized_pnl = Column(Numeric(20, 8), nullable=False)
    realized_pnl = Column(Numeric(20, 8), nullable=False)

    # Asset allocation (JSON)
    asset_allocation = Column(Text)

    # Snapshot metadata
    snapshot_date = Column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )
    snapshot_type = Column(String(20), default="daily")  # daily, weekly, monthly

    # Relationships
    portfolio = relationship("Portfolio", back_populates="performance_snapshots")

    # Indexes for performance
    __table_args__ = (
        Index("idx_portfolio_snapshot_date", "portfolio_id", "snapshot_date"),
    )

    def __repr__(self):
        return f"<PortfolioSnapshot {self.portfolio.name} {self.total_value} at {self.snapshot_date}>"
