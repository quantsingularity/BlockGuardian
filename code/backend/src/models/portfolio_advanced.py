"""
Enhanced Portfolio and Asset Models for Financial Services
Implements comprehensive portfolio management with advanced risk analytics and compliance
"""

import uuid
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum
from typing import Any, Dict, List

from sqlalchemy import (Boolean, CheckConstraint, Column, DateTime, ForeignKey,
                        Index, Integer, Numeric, String, Text)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from .base import BaseModel


class AssetClass(Enum):
    """Asset class enumeration for portfolio allocation"""

    EQUITY = "equity"
    FIXED_INCOME = "fixed_income"
    COMMODITY = "commodity"
    REAL_ESTATE = "real_estate"
    CRYPTOCURRENCY = "cryptocurrency"
    CASH = "cash"
    ALTERNATIVE = "alternative"


class AssetType(Enum):
    """Detailed asset type enumeration"""

    STOCK = "stock"
    BOND = "bond"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    INDEX_FUND = "index_fund"
    REIT = "reit"
    COMMODITY = "commodity"
    CRYPTOCURRENCY = "cryptocurrency"
    FOREX = "forex"
    OPTION = "option"
    FUTURE = "future"
    WARRANT = "warrant"
    CERTIFICATE = "certificate"
    STRUCTURED_PRODUCT = "structured_product"


class PortfolioType(Enum):
    """Portfolio type enumeration"""

    INDIVIDUAL = "individual"
    JOINT = "joint"
    IRA_TRADITIONAL = "ira_traditional"
    IRA_ROTH = "ira_roth"
    CORPORATE = "corporate"
    TRUST = "trust"
    MANAGED = "managed"
    ROBO_ADVISOR = "robo_advisor"


class RiskLevel(Enum):
    """Risk level enumeration"""

    CONSERVATIVE = "conservative"
    MODERATE_CONSERVATIVE = "moderate_conservative"
    MODERATE = "moderate"
    MODERATE_AGGRESSIVE = "moderate_aggressive"
    AGGRESSIVE = "aggressive"


class RebalanceStrategy(Enum):
    """Portfolio rebalancing strategy"""

    NONE = "none"
    THRESHOLD = "threshold"
    CALENDAR = "calendar"
    TACTICAL = "tactical"
    STRATEGIC = "strategic"


class Portfolio(BaseModel):
    """Enhanced portfolio model with comprehensive financial features"""

    __tablename__ = "enhanced_portfolios"

    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_number = Column(String(20), unique=True, nullable=False, index=True)

    # Basic information
    name = Column(String(200), nullable=False)
    description = Column(Text)
    portfolio_type = Column(String(30), nullable=False, index=True)

    # Owner information
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    advisor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))  # Financial advisor

    # Portfolio configuration
    base_currency = Column(String(3), default="USD", nullable=False)
    risk_level = Column(String(30), nullable=False, index=True)
    investment_objective = Column(Text)
    time_horizon = Column(String(20))  # short, medium, long

    # Financial metrics
    total_value = Column(Numeric(20, 2), default=Decimal("0.00"), nullable=False)
    cash_balance = Column(Numeric(20, 2), default=Decimal("0.00"), nullable=False)
    invested_amount = Column(Numeric(20, 2), default=Decimal("0.00"), nullable=False)
    available_cash = Column(Numeric(20, 2), default=Decimal("0.00"), nullable=False)

    # Performance metrics
    unrealized_pnl = Column(Numeric(20, 2), default=Decimal("0.00"))
    realized_pnl = Column(Numeric(20, 2), default=Decimal("0.00"))
    total_return = Column(Numeric(20, 2), default=Decimal("0.00"))
    annualized_return = Column(Numeric(10, 4))
    sharpe_ratio = Column(Numeric(10, 4))
    beta = Column(Numeric(10, 4))
    alpha = Column(Numeric(10, 4))
    volatility = Column(Numeric(10, 4))
    max_drawdown = Column(Numeric(10, 4))

    # Risk management
    var_95 = Column(Numeric(20, 2))  # Value at Risk (95% confidence)
    var_99 = Column(Numeric(20, 2))  # Value at Risk (99% confidence)
    expected_shortfall = Column(Numeric(20, 2))  # Conditional VaR
    risk_score = Column(Integer, default=50)  # 0-100 scale

    # Portfolio limits and constraints
    max_position_size = Column(Numeric(5, 4), default=Decimal("0.10"))  # 10%
    max_sector_allocation = Column(Numeric(5, 4), default=Decimal("0.25"))  # 25%
    max_country_allocation = Column(Numeric(5, 4), default=Decimal("0.50"))  # 50%
    min_cash_percentage = Column(Numeric(5, 4), default=Decimal("0.05"))  # 5%
    max_leverage = Column(Numeric(5, 2), default=Decimal("1.00"))  # No leverage

    # Rebalancing configuration
    rebalance_strategy = Column(String(20), default=RebalanceStrategy.NONE.value)
    rebalance_threshold = Column(Numeric(5, 4), default=Decimal("0.05"))  # 5%
    rebalance_frequency = Column(Integer, default=90)  # Days
    last_rebalance_date = Column(DateTime(timezone=True))
    next_rebalance_date = Column(DateTime(timezone=True))
    auto_rebalance = Column(Boolean, default=False)

    # Target allocation (stored as JSON)
    target_allocation = Column(JSONB)  # Asset class target percentages

    # Status and settings
    is_active = Column(Boolean, default=True, nullable=False)
    is_taxable = Column(Boolean, default=True, nullable=False)
    allow_fractional_shares = Column(Boolean, default=True)
    auto_dividend_reinvest = Column(Boolean, default=True)

    # Benchmark and comparison
    benchmark_symbol = Column(String(20))  # e.g., "SPY", "VTI"
    benchmark_name = Column(String(100))

    # Compliance and reporting
    requires_accredited_investor = Column(Boolean, default=False)
    suitability_score = Column(Integer)  # 0-100
    last_suitability_review = Column(DateTime(timezone=True))

    # Additional metadata
    metadata = Column(JSONB)
    tags = Column(String(500))
    notes = Column(Text)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="portfolios")
    advisor = relationship("User", foreign_keys=[advisor_id])
    holdings = relationship(
        "PortfolioHolding", back_populates="portfolio", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="portfolio", cascade="all, delete-orphan"
    )
    snapshots = relationship(
        "PortfolioSnapshot", back_populates="portfolio", cascade="all, delete-orphan"
    )

    # Indexes for performance
    __table_args__ = (
        Index("idx_portfolio_user_active", "user_id", "is_active"),
        Index("idx_portfolio_type_risk", "portfolio_type", "risk_level"),
        Index("idx_portfolio_value_date", "total_value", "created_at"),
        CheckConstraint("total_value >= 0", name="check_positive_total_value"),
        CheckConstraint("cash_balance >= 0", name="check_positive_cash_balance"),
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.portfolio_number:
            self.portfolio_number = self.generate_portfolio_number()

    @staticmethod
    def generate_portfolio_number() -> str:
        """Generate unique portfolio number"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_suffix = str(uuid.uuid4())[:8].upper()
        return f"PF-{timestamp}-{random_suffix}"

    def calculate_total_value(self) -> Decimal:
        """Calculate current total portfolio value"""
        total = self.cash_balance

        for holding in self.holdings:
            if holding.is_active:
                total += holding.current_value or Decimal("0.00")

        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def update_portfolio_metrics(self):
        """Update all portfolio metrics"""
        # Update basic values
        self.total_value = self.calculate_total_value()

        # Calculate invested amount and P&L
        invested_amount = Decimal("0.00")
        unrealized_pnl = Decimal("0.00")

        for holding in self.holdings:
            if holding.is_active:
                invested_amount += holding.cost_basis or Decimal("0.00")
                unrealized_pnl += holding.unrealized_pnl or Decimal("0.00")

        self.invested_amount = invested_amount
        self.unrealized_pnl = unrealized_pnl
        self.total_return = self.realized_pnl + self.unrealized_pnl

        # Update available cash (considering pending transactions)
        self.available_cash = self.cash_balance  # Simplified

        # Update metadata
        if not self.metadata:
            self.metadata = {}

        self.metadata["last_metrics_update"] = datetime.now(timezone.utc).isoformat()

    def calculate_total_return_percentage(self) -> Decimal:
        """Calculate total return percentage"""

        # Logical Correction: Ensure total_value is not zero before division
        if self.total_value <= 0:
            return Decimal("0.00")

        # Simplified calculation: (Total Return / Total Value) * 100
        # This is a very simplified return calculation, but fixes the division by zero.
        return (self.total_return / self.total_value).quantize(
            Decimal("0.0001"), rounding=ROUND_HALF_UP
        ) * 100  # Return as percentage

    def get_asset_allocation(self) -> Dict[str, Decimal]:
        """Get current asset allocation by asset class"""
        allocation = {}
        total_value = self.total_value

        if total_value <= 0:
            return allocation

        # Add cash allocation
        cash_percentage = (self.cash_balance / total_value) * 100
        allocation["cash"] = cash_percentage.quantize(Decimal("0.01"))

        # Add asset allocations
        for holding in self.holdings:
            if holding.is_active and holding.current_value:
                asset_class = holding.asset.asset_class if holding.asset else "unknown"
                percentage = (holding.current_value / total_value) * 100

                if asset_class in allocation:
                    allocation[asset_class] += percentage
                else:
                    allocation[asset_class] = percentage.quantize(Decimal("0.01"))

        return allocation

    def get_sector_allocation(self) -> Dict[str, Decimal]:
        """Get current allocation by sector"""
        allocation = {}
        total_value = self.total_value

        if total_value <= 0:
            return allocation

        for holding in self.holdings:
            if holding.is_active and holding.current_value and holding.asset:
                sector = holding.asset.sector or "Other"
                percentage = (holding.current_value / total_value) * 100

                if sector in allocation:
                    allocation[sector] += percentage
                else:
                    allocation[sector] = percentage.quantize(Decimal("0.01"))

        return allocation

    def get_country_allocation(self) -> Dict[str, Decimal]:
        """Get current allocation by country"""
        allocation = {}
        total_value = self.total_value

        if total_value <= 0:
            return allocation

        for holding in self.holdings:
            if holding.is_active and holding.current_value and holding.asset:
                country = holding.asset.country or "Unknown"
                percentage = (holding.current_value / total_value) * 100

                if country in allocation:
                    allocation[country] += percentage
                else:
                    allocation[country] = percentage.quantize(Decimal("0.01"))

        return allocation

    def check_risk_violations(self) -> List[Dict[str, Any]]:
        """Check for risk limit violations"""
        violations = []
        total_value = self.total_value

        if total_value <= 0:
            return violations

        # Check position size limits
        for holding in self.holdings:
            if holding.is_active and holding.current_value:
                position_percentage = holding.current_value / total_value
                if position_percentage > self.max_position_size:
                    violations.append(
                        {
                            "type": "position_size",
                            "asset": (
                                holding.asset.symbol if holding.asset else "Unknown"
                            ),
                            "current_percentage": float(position_percentage * 100),
                            "limit_percentage": float(self.max_position_size * 100),
                            "severity": (
                                "high"
                                if position_percentage > self.max_position_size * 1.5
                                else "medium"
                            ),
                        }
                    )

        # Check sector allocation limits
        sector_allocation = self.get_sector_allocation()
        for sector, percentage in sector_allocation.items():
            if percentage > (self.max_sector_allocation * 100):
                violations.append(
                    {
                        "type": "sector_allocation",
                        "sector": sector,
                        "current_percentage": float(percentage),
                        "limit_percentage": float(self.max_sector_allocation * 100),
                        "severity": "medium",
                    }
                )

        # Check country allocation limits
        country_allocation = self.get_country_allocation()
        for country, percentage in country_allocation.items():
            if percentage > (self.max_country_allocation * 100):
                violations.append(
                    {
                        "type": "country_allocation",
                        "country": country,
                        "current_percentage": float(percentage),
                        "limit_percentage": float(self.max_country_allocation * 100),
                        "severity": "medium",
                    }
                )

        # Check minimum cash requirement
        cash_percentage = self.cash_balance / total_value
        if cash_percentage < self.min_cash_percentage:
            violations.append(
                {
                    "type": "minimum_cash",
                    "current_percentage": float(cash_percentage * 100),
                    "minimum_percentage": float(self.min_cash_percentage * 100),
                    "severity": "low",
                }
            )

        return violations

    def needs_rebalancing(self) -> bool:
        """Check if portfolio needs rebalancing"""
        if not self.auto_rebalance or not self.target_allocation:
            return False

        current_allocation = self.get_asset_allocation()

        for asset_class, target_percentage in self.target_allocation.items():
            current_percentage = float(
                current_allocation.get(asset_class, Decimal("0.00"))
            )
            target = float(target_percentage)

            deviation = abs(current_percentage - target) / 100
            if deviation > float(self.rebalance_threshold):
                return True

        return False

    def calculate_performance_metrics(self, period_days: int = 365) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics"""
        # This would typically involve complex calculations using historical data
        # For now, returning placeholder structure

        return {
            "total_return": float(self.total_return) if self.total_return else 0.0,
            "annualized_return": (
                float(self.annualized_return) if self.annualized_return else 0.0
            ),
            "volatility": float(self.volatility) if self.volatility else 0.0,
            "sharpe_ratio": float(self.sharpe_ratio) if self.sharpe_ratio else 0.0,
            "beta": float(self.beta) if self.beta else 1.0,
            "alpha": float(self.alpha) if self.alpha else 0.0,
            "max_drawdown": float(self.max_drawdown) if self.max_drawdown else 0.0,
            "var_95": float(self.var_95) if self.var_95 else 0.0,
            "var_99": float(self.var_99) if self.var_99 else 0.0,
            "expected_shortfall": (
                float(self.expected_shortfall) if self.expected_shortfall else 0.0
            ),
        }

    def create_snapshot(self) -> "PortfolioSnapshot":
        """Create a performance snapshot"""
        snapshot = PortfolioSnapshot(
            portfolio_id=self.id,
            total_value=self.total_value,
            cash_balance=self.cash_balance,
            invested_amount=self.invested_amount,
            unrealized_pnl=self.unrealized_pnl,
            realized_pnl=self.realized_pnl,
            asset_allocation=self.get_asset_allocation(),
            sector_allocation=self.get_sector_allocation(),
            country_allocation=self.get_country_allocation(),
            performance_metrics=self.calculate_performance_metrics(),
            risk_violations=self.check_risk_violations(),
        )

        return snapshot

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert portfolio to dictionary"""
        result = {
            "id": str(self.id),
            "portfolio_number": self.portfolio_number,
            "name": self.name,
            "description": self.description,
            "portfolio_type": self.portfolio_type,
            "user_id": str(self.user_id),
            "base_currency": self.base_currency,
            "risk_level": self.risk_level,
            "investment_objective": self.investment_objective,
            "time_horizon": self.time_horizon,
            "total_value": float(self.total_value),
            "cash_balance": float(self.cash_balance),
            "invested_amount": float(self.invested_amount),
            "unrealized_pnl": (
                float(self.unrealized_pnl) if self.unrealized_pnl else 0.0
            ),
            "realized_pnl": float(self.realized_pnl) if self.realized_pnl else 0.0,
            "total_return": float(self.total_return) if self.total_return else 0.0,
            "is_active": self.is_active,
            "is_taxable": self.is_taxable,
            "benchmark_symbol": self.benchmark_symbol,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_sensitive:
            result.update(
                {
                    "advisor_id": str(self.advisor_id) if self.advisor_id else None,
                    "available_cash": float(self.available_cash),
                    "performance_metrics": self.calculate_performance_metrics(),
                    "asset_allocation": {
                        k: float(v) for k, v in self.get_asset_allocation().items()
                    },
                    "risk_violations": self.check_risk_violations(),
                    "target_allocation": self.target_allocation,
                    "metadata": self.metadata,
                    "notes": self.notes,
                }
            )

        return result


class Asset(BaseModel):
    """Enhanced asset model with comprehensive market data"""

    __tablename__ = "enhanced_assets"

    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String(20), unique=True, nullable=False, index=True)

    # Basic information
    name = Column(String(200), nullable=False)
    asset_type = Column(String(30), nullable=False, index=True)
    asset_class = Column(String(30), nullable=False, index=True)

    # Classification
    sector = Column(String(100), index=True)
    industry = Column(String(100))
    sub_industry = Column(String(100))
    country = Column(String(50), index=True)
    region = Column(String(50))

    # Identifiers
    isin = Column(String(12), unique=True, index=True)
    cusip = Column(String(9), index=True)
    sedol = Column(String(7))
    bloomberg_id = Column(String(20))
    reuters_id = Column(String(20))

    # Trading information
    primary_exchange = Column(String(50))
    currency = Column(String(3), default="USD", nullable=False)
    lot_size = Column(Integer, default=1)
    tick_size = Column(Numeric(10, 6))

    # Market data
    current_price = Column(Numeric(20, 8))
    previous_close = Column(Numeric(20, 8))
    open_price = Column(Numeric(20, 8))
    high_price = Column(Numeric(20, 8))
    low_price = Column(Numeric(20, 8))
    volume = Column(Integer)
    market_cap = Column(Numeric(20, 2))

    # Calculated fields
    day_change = Column(Numeric(20, 8))
    day_change_percent = Column(Numeric(10, 4))
    week_52_high = Column(Numeric(20, 8))
    week_52_low = Column(Numeric(20, 8))

    # Risk metrics
    beta = Column(Numeric(10, 4))
    volatility = Column(Numeric(10, 4))
    var_95 = Column(Numeric(20, 8))

    # Fundamental data (for stocks)
    pe_ratio = Column(Numeric(10, 2))
    pb_ratio = Column(Numeric(10, 2))
    dividend_yield = Column(Numeric(10, 4))
    earnings_per_share = Column(Numeric(10, 2))
    book_value_per_share = Column(Numeric(10, 2))

    # Status and metadata
    is_active = Column(Boolean, default=True, nullable=False)
    is_tradeable = Column(Boolean, default=True, nullable=False)
    is_shortable = Column(Boolean, default=False)
    is_marginable = Column(Boolean, default=False)

    # Data quality
    last_updated = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    data_source = Column(String(50))
    data_quality_score = Column(Integer, default=100)  # 0-100

    # Additional metadata
    metadata = Column(JSONB)
    description = Column(Text)

    # Relationships
    holdings = relationship("PortfolioHolding", back_populates="asset")
    price_history = relationship(
        "AssetPrice", back_populates="asset", cascade="all, delete-orphan"
    )

    # Indexes for performance
    __table_args__ = (
        Index("idx_asset_type_class", "asset_type", "asset_class"),
        Index("idx_asset_sector_country", "sector", "country"),
        Index("idx_asset_updated", "last_updated"),
        Index("idx_asset_tradeable", "is_tradeable", "is_active"),
    )

    def update_price_data(self, price_data: Dict[str, Any]):
        """Update asset price and market data"""
        self.previous_close = self.current_price
        self.current_price = Decimal(str(price_data.get("price", 0)))
        self.open_price = Decimal(str(price_data.get("open", 0)))
        self.high_price = Decimal(str(price_data.get("high", 0)))
        self.low_price = Decimal(str(price_data.get("low", 0)))
        self.volume = price_data.get("volume", 0)

        # Calculate changes
        if self.previous_close and self.current_price:
            self.day_change = self.current_price - self.previous_close
            if self.previous_close > 0:
                self.day_change_percent = (
                    self.day_change / self.previous_close * 100
                ).quantize(Decimal("0.01"))

        self.last_updated = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """Convert asset to dictionary"""
        return {
            "id": str(self.id),
            "symbol": self.symbol,
            "name": self.name,
            "asset_type": self.asset_type,
            "asset_class": self.asset_class,
            "sector": self.sector,
            "industry": self.industry,
            "country": self.country,
            "currency": self.currency,
            "current_price": float(self.current_price) if self.current_price else None,
            "day_change": float(self.day_change) if self.day_change else None,
            "day_change_percent": (
                float(self.day_change_percent) if self.day_change_percent else None
            ),
            "volume": self.volume,
            "market_cap": float(self.market_cap) if self.market_cap else None,
            "is_active": self.is_active,
            "is_tradeable": self.is_tradeable,
            "last_updated": (
                self.last_updated.isoformat() if self.last_updated else None
            ),
        }


class PortfolioHolding(BaseModel):
    """Enhanced portfolio holding with comprehensive position tracking"""

    __tablename__ = "enhanced_portfolio_holdings"

    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relationships
    portfolio_id = Column(
        UUID(as_uuid=True),
        ForeignKey("enhanced_portfolios.id"),
        nullable=False,
        index=True,
    )
    asset_id = Column(
        UUID(as_uuid=True), ForeignKey("enhanced_assets.id"), nullable=False, index=True
    )

    # Position information
    quantity = Column(Numeric(20, 8), nullable=False)
    average_cost = Column(Numeric(20, 8), nullable=False)
    cost_basis = Column(Numeric(20, 2), nullable=False)

    # Current valuation
    current_price = Column(Numeric(20, 8))
    current_value = Column(Numeric(20, 2))
    unrealized_pnl = Column(Numeric(20, 2))
    unrealized_pnl_percent = Column(Numeric(10, 4))

    # Position tracking
    first_purchase_date = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    last_transaction_date = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Tax lot tracking
    tax_lots = Column(JSONB)  # Array of tax lot information

    # Risk metrics
    position_beta = Column(Numeric(10, 4))
    position_var = Column(Numeric(20, 2))

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Additional metadata
    metadata = Column(JSONB)
    notes = Column(Text)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")
    asset = relationship("Asset", back_populates="holdings")

    # Indexes for performance
    __table_args__ = (
        Index("idx_holding_portfolio_asset", "portfolio_id", "asset_id"),
        Index("idx_holding_active", "is_active"),
        CheckConstraint("quantity >= 0", name="check_positive_quantity"),
        CheckConstraint("cost_basis >= 0", name="check_positive_cost_basis"),
    )

    def update_valuation(self):
        """Update current valuation based on asset price"""
        if self.asset and self.asset.current_price:
            self.current_price = self.asset.current_price
            self.current_value = (self.quantity * self.current_price).quantize(
                Decimal("0.01")
            )
            self.unrealized_pnl = self.current_value - self.cost_basis

            if self.cost_basis > 0:
                self.unrealized_pnl_percent = (
                    (self.unrealized_pnl / self.cost_basis) * 100
                ).quantize(Decimal("0.01"))

    def add_position(
        self, quantity: Decimal, price: Decimal, transaction_date: datetime = None
    ):
        """Add to position (buy transaction)"""
        if transaction_date is None:
            transaction_date = datetime.now(timezone.utc)

        # Calculate new averages
        total_cost = quantity * price
        new_total_quantity = self.quantity + quantity
        new_total_cost = self.cost_basis + total_cost

        # Update position
        self.average_cost = (new_total_cost / new_total_quantity).quantize(
            Decimal("0.01")
        )
        self.quantity = new_total_quantity
        self.cost_basis = new_total_cost.quantize(Decimal("0.01"))
        self.last_transaction_date = transaction_date

        # Add tax lot
        if not self.tax_lots:
            self.tax_lots = []

        self.tax_lots.append(
            {
                "quantity": float(quantity),
                "price": float(price),
                "date": transaction_date.isoformat(),
                "cost_basis": float(total_cost),
            }
        )

        # Update valuation
        self.update_valuation()

    def reduce_position(
        self, quantity: Decimal, price: Decimal, transaction_date: datetime = None
    ) -> Decimal:
        """Reduce position (sell transaction) using FIFO"""
        if transaction_date is None:
            transaction_date = datetime.now(timezone.utc)

        if quantity > self.quantity:
            raise ValueError("Cannot sell more shares than owned")

        # Calculate realized P&L using FIFO
        remaining_to_sell = quantity
        realized_pnl = Decimal("0.00")
        updated_tax_lots = []

        for lot in self.tax_lots or []:
            if remaining_to_sell <= 0:
                updated_tax_lots.append(lot)
                continue

            lot_quantity = Decimal(str(lot["quantity"]))
            lot_price = Decimal(str(lot["price"]))

            if lot_quantity <= remaining_to_sell:
                # Sell entire lot
                lot_pnl = (price - lot_price) * lot_quantity
                realized_pnl += lot_pnl
                remaining_to_sell -= lot_quantity
            else:
                # Partial lot sale
                sold_from_lot = remaining_to_sell
                lot_pnl = (price - lot_price) * sold_from_lot
                realized_pnl += lot_pnl

                # Update lot
                lot["quantity"] = float(lot_quantity - sold_from_lot)
                lot["cost_basis"] = float((lot_quantity - sold_from_lot) * lot_price)
                updated_tax_lots.append(lot)
                remaining_to_sell = Decimal("0.00")

        # Update position
        self.quantity -= quantity
        self.cost_basis -= (self.average_cost * quantity).quantize(Decimal("0.01"))
        self.tax_lots = updated_tax_lots
        self.last_transaction_date = transaction_date

        # If position is closed, mark as inactive
        if self.quantity == 0:
            self.is_active = False

        # Update valuation
        self.update_valuation()

        return realized_pnl.quantize(Decimal("0.01"))

    def to_dict(self) -> Dict[str, Any]:
        """Convert holding to dictionary"""
        return {
            "id": str(self.id),
            "portfolio_id": str(self.portfolio_id),
            "asset_id": str(self.asset_id),
            "asset_symbol": self.asset.symbol if self.asset else None,
            "asset_name": self.asset.name if self.asset else None,
            "quantity": float(self.quantity),
            "average_cost": float(self.average_cost),
            "cost_basis": float(self.cost_basis),
            "current_price": float(self.current_price) if self.current_price else None,
            "current_value": float(self.current_value) if self.current_value else None,
            "unrealized_pnl": (
                float(self.unrealized_pnl) if self.unrealized_pnl else None
            ),
            "unrealized_pnl_percent": (
                float(self.unrealized_pnl_percent)
                if self.unrealized_pnl_percent
                else None
            ),
            "first_purchase_date": self.first_purchase_date.isoformat(),
            "last_transaction_date": self.last_transaction_date.isoformat(),
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PortfolioSnapshot(BaseModel):
    """Portfolio performance snapshot for historical tracking"""

    __tablename__ = "portfolio_snapshots"

    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(
        UUID(as_uuid=True),
        ForeignKey("enhanced_portfolios.id"),
        nullable=False,
        index=True,
    )

    # Snapshot data
    snapshot_date = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    total_value = Column(Numeric(20, 2), nullable=False)
    cash_balance = Column(Numeric(20, 2), nullable=False)
    invested_amount = Column(Numeric(20, 2), nullable=False)
    unrealized_pnl = Column(Numeric(20, 2))
    realized_pnl = Column(Numeric(20, 2))

    # Allocations (stored as JSON)
    asset_allocation = Column(JSONB)
    sector_allocation = Column(JSONB)
    country_allocation = Column(JSONB)

    # Performance metrics
    performance_metrics = Column(JSONB)

    # Risk data
    risk_violations = Column(JSONB)
    risk_score = Column(Integer)

    # Market context
    market_conditions = Column(JSONB)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="snapshots")

    # Indexes for performance
    __table_args__ = (
        Index("idx_snapshot_portfolio_date", "portfolio_id", "snapshot_date"),
        Index("idx_snapshot_date", "snapshot_date"),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert snapshot to dictionary"""
        return {
            "id": str(self.id),
            "portfolio_id": str(self.portfolio_id),
            "snapshot_date": self.snapshot_date.isoformat(),
            "total_value": float(self.total_value),
            "cash_balance": float(self.cash_balance),
            "invested_amount": float(self.invested_amount),
            "unrealized_pnl": (
                float(self.unrealized_pnl) if self.unrealized_pnl else None
            ),
            "realized_pnl": float(self.realized_pnl) if self.realized_pnl else None,
            "asset_allocation": self.asset_allocation,
            "sector_allocation": self.sector_allocation,
            "country_allocation": self.country_allocation,
            "performance_metrics": self.performance_metrics,
            "risk_violations": self.risk_violations,
            "risk_score": self.risk_score,
            "market_conditions": self.market_conditions,
        }


class AssetPrice(BaseModel):
    """Historical asset price data"""

    __tablename__ = "asset_prices"

    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(
        UUID(as_uuid=True), ForeignKey("enhanced_assets.id"), nullable=False, index=True
    )

    # Price data
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    open_price = Column(Numeric(20, 8))
    high_price = Column(Numeric(20, 8))
    low_price = Column(Numeric(20, 8))
    close_price = Column(Numeric(20, 8), nullable=False)
    volume = Column(Integer)

    # Adjusted prices (for splits, dividends)
    adjusted_close = Column(Numeric(20, 8))

    # Data source and quality
    data_source = Column(String(50))
    data_quality = Column(String(20), default="good")  # good, fair, poor

    # Relationships
    asset = relationship("Asset", back_populates="price_history")

    # Indexes for performance
    __table_args__ = (
        Index("idx_price_asset_timestamp", "asset_id", "timestamp"),
        Index("idx_price_timestamp", "timestamp"),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert price data to dictionary"""
        return {
            "id": str(self.id),
            "asset_id": str(self.asset_id),
            "timestamp": self.timestamp.isoformat(),
            "open_price": float(self.open_price) if self.open_price else None,
            "high_price": float(self.high_price) if self.high_price else None,
            "low_price": float(self.low_price) if self.low_price else None,
            "close_price": float(self.close_price),
            "volume": self.volume,
            "adjusted_close": (
                float(self.adjusted_close) if self.adjusted_close else None
            ),
            "data_source": self.data_source,
            "data_quality": self.data_quality,
        }
