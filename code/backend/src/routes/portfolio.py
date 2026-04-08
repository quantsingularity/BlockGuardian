"""
Portfolio management API routes for BlockGuardian Backend
Implements comprehensive portfolio operations, asset management, and transaction processing
"""

import json
from datetime import datetime
from decimal import Decimal
from typing import Any

from flask import Blueprint, g, jsonify, request
from src.models.base import paginate_query
from src.models.portfolio import (
    Asset,
    AssetType,
    Portfolio,
    PortfolioHolding,
    PortfolioType,
    RiskLevel,
    Transaction,
    TransactionStatus,
    TransactionType,
)
from src.models.user import User, db
from src.security.audit import AuditEventType, audit_logger
from src.security.auth import Permission, jwt_required, permission_required
from src.security.rate_limiting import RateLimitScope, rate_limit
from src.security.validation import ValidationError, security_validator

portfolio_bp = Blueprint("portfolio", __name__)


def _safe_decimal(value: Any) -> Any:
    """Safely convert value for JSON serialization"""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _portfolio_to_dict(portfolio: Portfolio) -> dict:
    """Convert portfolio to dict with proper serialization"""
    return {
        "id": portfolio.id,
        "name": portfolio.name,
        "description": portfolio.description,
        "portfolio_type": (
            portfolio.portfolio_type.value if portfolio.portfolio_type else None
        ),
        "owner_id": portfolio.owner_id,
        "base_currency": portfolio.base_currency,
        "risk_level": portfolio.risk_level.value if portfolio.risk_level else None,
        "investment_objective": portfolio.investment_objective,
        "total_value": _safe_decimal(portfolio.total_value),
        "cash_balance": _safe_decimal(portfolio.cash_balance),
        "invested_amount": _safe_decimal(portfolio.invested_amount),
        "unrealized_pnl": _safe_decimal(portfolio.unrealized_pnl),
        "realized_pnl": _safe_decimal(portfolio.realized_pnl),
        "max_position_size": portfolio.max_position_size,
        "max_sector_allocation": portfolio.max_sector_allocation,
        "stop_loss_threshold": portfolio.stop_loss_threshold,
        "is_active": portfolio.is_active,
        "auto_rebalance": portfolio.auto_rebalance,
        "rebalance_frequency": portfolio.rebalance_frequency,
        "created_at": (
            portfolio.created_at.isoformat() if portfolio.created_at else None
        ),
        "updated_at": (
            portfolio.updated_at.isoformat() if portfolio.updated_at else None
        ),
    }


def _asset_to_dict(asset: Asset) -> dict:
    """Convert asset to dict"""
    return {
        "id": asset.id,
        "symbol": asset.symbol,
        "name": asset.name,
        "asset_type": asset.asset_type.value if asset.asset_type else None,
        "description": asset.description,
        "sector": asset.sector,
        "currency": asset.currency,
        "exchange": asset.exchange,
        "current_price": _safe_decimal(asset.current_price),
        "previous_close": _safe_decimal(asset.previous_close),
        "day_change": _safe_decimal(asset.day_change),
        "day_change_percent": asset.day_change_percent,
        "is_tradeable": asset.is_tradeable,
        "is_active": asset.is_active,
    }


def _holding_to_dict(holding: PortfolioHolding) -> dict:
    """Convert holding to dict"""
    return {
        "id": holding.id,
        "portfolio_id": holding.portfolio_id,
        "asset_id": holding.asset_id,
        "quantity": _safe_decimal(holding.quantity),
        "average_cost": _safe_decimal(holding.average_cost),
        "cost_basis": _safe_decimal(holding.cost_basis),
        "current_price": _safe_decimal(holding.current_price),
        "current_value": _safe_decimal(holding.current_value),
        "unrealized_pnl": _safe_decimal(holding.unrealized_pnl),
        "unrealized_pnl_percent": holding.unrealized_pnl_percent,
        "is_active": holding.is_active,
        "asset": _asset_to_dict(holding.asset) if holding.asset else None,
    }


def _transaction_to_dict(tx: Transaction) -> dict:
    """Convert transaction to dict"""
    return {
        "id": tx.id,
        "transaction_type": tx.transaction_type.value if tx.transaction_type else None,
        "status": tx.status.value if tx.status else None,
        "user_id": tx.user_id,
        "portfolio_id": tx.portfolio_id,
        "asset_id": tx.asset_id,
        "quantity": _safe_decimal(tx.quantity),
        "price": _safe_decimal(tx.price),
        "amount": _safe_decimal(tx.amount),
        "fee": _safe_decimal(tx.fee),
        "net_amount": _safe_decimal(tx.net_amount),
        "currency": tx.currency,
        "executed_at": tx.executed_at.isoformat() if tx.executed_at else None,
        "settled_at": tx.settled_at.isoformat() if tx.settled_at else None,
        "confirmation_number": tx.confirmation_number,
        "created_at": tx.created_at.isoformat() if tx.created_at else None,
    }


@portfolio_bp.route("/", methods=["GET"], strict_slashes=False)
@jwt_required
@rate_limit(limit=100, window=3600, scope=RateLimitScope.PER_USER)
def get_portfolios() -> Any:
    """Get user's portfolios"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)
        query = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.owner_id == g.current_user_id,
                Portfolio.is_active == True,
            )
            .order_by(Portfolio.created_at.desc())
        )
        result = paginate_query(query, page, per_page)
        portfolios = []
        for portfolio in result["items"]:
            pd = _portfolio_to_dict(portfolio)
            pd["asset_allocation"] = portfolio.get_asset_allocation()
            pd["risk_violations"] = portfolio.check_risk_limits()
            portfolios.append(pd)
        return (
            jsonify(
                {
                    "portfolios": portfolios,
                    "total": result["total"],
                    "page": result["page"],
                    "per_page": result["per_page"],
                    "pages": result["pages"],
                }
            ),
            200,
        )
    except Exception:
        return (jsonify({"error": "Failed to get portfolios"}), 500)


@portfolio_bp.route("/", methods=["POST"], strict_slashes=False)
@jwt_required
@permission_required(Permission.CREATE_PORTFOLIO)
@rate_limit(limit=10, window=3600, scope=RateLimitScope.PER_USER)
def create_portfolio() -> Any:
    """Create a new portfolio"""
    try:
        data = security_validator.validate_json_input(request.get_json())
        if "name" not in data:
            return (jsonify({"error": "Portfolio name is required"}), 400)
        threats = security_validator.check_security_threats(json.dumps(data))
        if threats:
            audit_logger.log_security_alert(
                "portfolio_creation_security_threat",
                user_id=g.current_user_id,
                details={"threats": threats},
            )
            return (jsonify({"error": "Invalid input detected"}), 400)

        # Validate portfolio_type if provided
        portfolio_type_str = data.get("portfolio_type", "personal")
        try:
            portfolio_type = PortfolioType(portfolio_type_str)
        except ValueError:
            return (
                jsonify({"error": f"Invalid portfolio type: {portfolio_type_str}"}),
                400,
            )

        # Validate risk_level if provided
        risk_level_str = data.get("risk_level", "moderate")
        try:
            risk_level = RiskLevel(risk_level_str)
        except ValueError:
            return (jsonify({"error": f"Invalid risk level: {risk_level_str}"}), 400)

        user = db.session.get(User, g.current_user_id)
        if not user:
            return (jsonify({"error": "User not found"}), 404)

        portfolio = Portfolio(
            name=data["name"],
            description=data.get("description"),
            owner_id=g.current_user_id,
            portfolio_type=portfolio_type,
            base_currency=data.get("base_currency", "USD"),
            risk_level=risk_level,
            investment_objective=data.get("investment_objective"),
        )
        if "max_position_size" in data:
            portfolio.max_position_size = float(data["max_position_size"])
        if "max_sector_allocation" in data:
            portfolio.max_sector_allocation = float(data["max_sector_allocation"])
        if "stop_loss_threshold" in data:
            portfolio.stop_loss_threshold = float(data["stop_loss_threshold"])
        if "initial_cash" in data:
            portfolio.cash_balance = Decimal(str(data["initial_cash"]))

        db.session.add(portfolio)
        db.session.commit()
        audit_logger.log_financial_event(
            event_type=AuditEventType.PORTFOLIO_CREATED,
            user_id=g.current_user_id,
            details={
                "portfolio_id": portfolio.id,
                "portfolio_name": portfolio.name,
                "portfolio_type": portfolio.portfolio_type.value,
            },
        )
        return (
            jsonify(
                {
                    "message": "Portfolio created successfully",
                    "portfolio": _portfolio_to_dict(portfolio),
                }
            ),
            201,
        )
    except ValidationError as e:
        return (jsonify({"error": e.message, "field": e.field}), 400)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to create portfolio"}), 500)


@portfolio_bp.route("/<int:portfolio_id>", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_PORTFOLIO)
def get_portfolio(portfolio_id: Any) -> Any:
    """Get portfolio details"""
    try:
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        pd = _portfolio_to_dict(portfolio)
        pd["asset_allocation"] = portfolio.get_asset_allocation()
        pd["risk_violations"] = portfolio.check_risk_limits()
        holdings = []
        for holding in portfolio.holdings.filter_by(is_active=True):
            holdings.append(_holding_to_dict(holding))
        pd["holdings"] = holdings
        return (jsonify({"portfolio": pd}), 200)
    except Exception:
        return (jsonify({"error": "Failed to get portfolio"}), 500)


@portfolio_bp.route("/<int:portfolio_id>", methods=["PUT"])
@jwt_required
@permission_required(Permission.UPDATE_PORTFOLIO)
@rate_limit(limit=20, window=3600, scope=RateLimitScope.PER_USER)
def update_portfolio(portfolio_id: Any) -> Any:
    """Update portfolio settings"""
    try:
        data = security_validator.validate_json_input(request.get_json())
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
                Portfolio.is_active == True,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        allowed_fields = [
            "name",
            "description",
            "investment_objective",
            "max_position_size",
            "max_sector_allocation",
            "stop_loss_threshold",
            "auto_rebalance",
            "rebalance_frequency",
        ]
        updated_fields = []
        for field in allowed_fields:
            if field in data:
                setattr(portfolio, field, data[field])
                updated_fields.append(field)
        # Handle risk_level with enum validation
        if "risk_level" in data:
            try:
                portfolio.risk_level = RiskLevel(data["risk_level"])
                updated_fields.append("risk_level")
            except ValueError:
                pass
        db.session.commit()
        audit_logger.log_financial_event(
            event_type=AuditEventType.PORTFOLIO_UPDATED,
            user_id=g.current_user_id,
            details={
                "portfolio_id": portfolio.id,
                "updated_fields": updated_fields,
            },
        )
        return (
            jsonify(
                {
                    "message": "Portfolio updated successfully",
                    "portfolio": _portfolio_to_dict(portfolio),
                }
            ),
            200,
        )
    except ValidationError as e:
        return (jsonify({"error": e.message, "field": e.field}), 400)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to update portfolio"}), 500)


@portfolio_bp.route("/<int:portfolio_id>", methods=["DELETE"])
@jwt_required
@permission_required(Permission.DELETE_PORTFOLIO)
def delete_portfolio(portfolio_id: Any) -> Any:
    """Soft-delete a portfolio"""
    try:
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        portfolio.is_active = False
        db.session.commit()
        return (jsonify({"message": "Portfolio deleted successfully"}), 200)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to delete portfolio"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/holdings", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_PORTFOLIO)
def get_portfolio_holdings(portfolio_id: Any) -> Any:
    """Get holdings for a portfolio"""
    try:
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        holdings = []
        for holding in portfolio.holdings.filter_by(is_active=True):
            holdings.append(_holding_to_dict(holding))
        return (jsonify({"holdings": holdings}), 200)
    except Exception:
        return (jsonify({"error": "Failed to get holdings"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/transactions", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_PORTFOLIO)
def get_portfolio_transactions(portfolio_id: Any) -> Any:
    """Get portfolio transaction history"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 50, type=int), 100)
        transaction_type = request.args.get("type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        query = (
            db.session.query(Transaction)
            .filter(Transaction.portfolio_id == portfolio_id)
            .order_by(Transaction.created_at.desc())
        )
        if transaction_type:
            try:
                tx_type = TransactionType(transaction_type)
                query = query.filter(Transaction.transaction_type == tx_type)
            except ValueError:
                pass
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Transaction.created_at >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Transaction.created_at <= end_dt)
        result = paginate_query(query, page, per_page)
        transactions = [_transaction_to_dict(tx) for tx in result["items"]]
        return (
            jsonify(
                {
                    "transactions": transactions,
                    "total": result["total"],
                    "page": result["page"],
                    "per_page": result["per_page"],
                }
            ),
            200,
        )
    except Exception:
        return (jsonify({"error": "Failed to get transactions"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/transactions", methods=["POST"])
@jwt_required
@permission_required(Permission.EXECUTE_TRADE)
@rate_limit(limit=50, window=3600, scope=RateLimitScope.PER_USER)
def create_transaction(portfolio_id: Any) -> Any:
    """Create a buy or sell transaction"""
    try:
        data = security_validator.validate_json_input(request.get_json())
        required_fields = ["transaction_type", "asset_id", "quantity", "price"]
        for field in required_fields:
            if field not in data:
                return (jsonify({"error": f"{field} is required"}), 400)

        try:
            tx_type = TransactionType(data["transaction_type"])
        except ValueError:
            return (
                jsonify(
                    {"error": f"Invalid transaction type: {data['transaction_type']}"}
                ),
                400,
            )

        quantity = security_validator.validate_financial_amount(data["quantity"])
        price = security_validator.validate_financial_amount(data["price"])

        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
                Portfolio.is_active == True,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)

        asset = db.session.query(Asset).filter(Asset.id == data["asset_id"]).first()
        if not asset:
            return (jsonify({"error": "Asset not found"}), 404)
        if not asset.is_tradeable:
            return (jsonify({"error": "Asset is not tradeable"}), 400)

        total_amount = quantity * price
        fee = total_amount * Decimal("0.001")

        if tx_type == TransactionType.BUY:
            net_amount = total_amount + fee
            if portfolio.cash_balance < net_amount:
                return (jsonify({"error": "Insufficient cash balance"}), 400)

            transaction = Transaction(
                transaction_type=tx_type,
                user_id=g.current_user_id,
                portfolio_id=portfolio.id,
                asset_id=asset.id,
                quantity=quantity,
                price=price,
                amount=total_amount,
                fee=fee,
                net_amount=net_amount,
                currency=portfolio.base_currency,
            )
            transaction.execute()

            holding = (
                db.session.query(PortfolioHolding)
                .filter(
                    PortfolioHolding.portfolio_id == portfolio.id,
                    PortfolioHolding.asset_id == asset.id,
                    PortfolioHolding.is_active == True,
                )
                .first()
            )
            if holding:
                holding.add_shares(quantity, price)
            else:
                holding = PortfolioHolding(
                    portfolio_id=portfolio.id,
                    asset_id=asset.id,
                    quantity=quantity,
                    average_cost=price,
                    cost_basis=total_amount,
                    current_price=asset.current_price or price,
                )
                holding.update_valuation(current_price=asset.current_price or price)
                db.session.add(holding)

            portfolio.cash_balance -= net_amount
            portfolio.invested_amount = (
                portfolio.invested_amount or Decimal("0")
            ) + total_amount
            portfolio.update_portfolio_metrics()
            transaction.complete()
            db.session.add(transaction)
            db.session.commit()
            return (
                jsonify(
                    {
                        "message": "Buy transaction created successfully",
                        "transaction": _transaction_to_dict(transaction),
                    }
                ),
                201,
            )

        elif tx_type == TransactionType.SELL:
            net_amount = total_amount - fee
            holding = (
                db.session.query(PortfolioHolding)
                .filter(
                    PortfolioHolding.portfolio_id == portfolio.id,
                    PortfolioHolding.asset_id == asset.id,
                    PortfolioHolding.is_active == True,
                )
                .first()
            )
            if not holding:
                return (jsonify({"error": "Insufficient holdings for this asset"}), 400)
            if holding.quantity < quantity:
                return (jsonify({"error": "Insufficient holdings to sell"}), 400)

            transaction = Transaction(
                transaction_type=tx_type,
                user_id=g.current_user_id,
                portfolio_id=portfolio.id,
                asset_id=asset.id,
                quantity=quantity,
                price=price,
                amount=total_amount,
                fee=fee,
                net_amount=net_amount,
                currency=portfolio.base_currency,
            )
            transaction.execute()
            realized_pnl = holding.remove_shares(quantity, price)
            portfolio.cash_balance += net_amount
            portfolio.realized_pnl = (
                portfolio.realized_pnl or Decimal("0")
            ) + realized_pnl
            portfolio.update_portfolio_metrics()
            transaction.complete()
            db.session.add(transaction)
            db.session.commit()
            return (
                jsonify(
                    {
                        "message": "Sell transaction created successfully",
                        "transaction": _transaction_to_dict(transaction),
                        "realized_pnl": float(realized_pnl),
                    }
                ),
                201,
            )
        else:
            return (
                jsonify({"error": "Transaction type not supported via this endpoint"}),
                400,
            )

    except ValidationError as e:
        return (jsonify({"error": e.message, "field": e.field}), 400)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to create transaction"}), 500)


@portfolio_bp.route(
    "/<int:portfolio_id>/transactions/<int:transaction_id>/cancel", methods=["POST"]
)
@jwt_required
def cancel_transaction(portfolio_id: Any, transaction_id: Any) -> Any:
    """Cancel a pending transaction"""
    try:
        transaction = (
            db.session.query(Transaction)
            .filter(
                Transaction.id == transaction_id,
                Transaction.portfolio_id == portfolio_id,
                Transaction.user_id == g.current_user_id,
            )
            .first()
        )
        if not transaction:
            return (jsonify({"error": "Transaction not found"}), 404)
        if transaction.status not in [
            TransactionStatus.PENDING,
            TransactionStatus.PROCESSING,
        ]:
            return (jsonify({"error": "Transaction cannot be cancelled"}), 400)
        transaction.cancel("User requested cancellation")
        db.session.commit()
        return (jsonify({"message": "Transaction cancelled successfully"}), 200)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to cancel transaction"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/buy", methods=["POST"])
@jwt_required
@permission_required(Permission.EXECUTE_TRADE)
@rate_limit(limit=50, window=3600, scope=RateLimitScope.PER_USER)
def buy_asset(portfolio_id: Any) -> Any:
    """Buy an asset for the portfolio"""
    try:
        data = security_validator.validate_json_input(request.get_json())
        required_fields = ["asset_symbol", "quantity", "price"]
        for field in required_fields:
            if field not in data:
                return (jsonify({"error": f"{field} is required"}), 400)
        quantity = security_validator.validate_financial_amount(data["quantity"])
        price = security_validator.validate_financial_amount(data["price"])
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
                Portfolio.is_active == True,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        asset = (
            db.session.query(Asset)
            .filter(Asset.symbol == data["asset_symbol"].upper())
            .first()
        )
        if not asset:
            return (jsonify({"error": "Asset not found"}), 404)
        if not asset.is_tradeable:
            return (jsonify({"error": "Asset is not tradeable"}), 400)
        total_amount = quantity * price
        fee = total_amount * Decimal("0.001")
        net_amount = total_amount + fee
        if portfolio.cash_balance < net_amount:
            return (jsonify({"error": "Insufficient cash balance"}), 400)
        transaction = Transaction(
            transaction_type=TransactionType.BUY,
            user_id=g.current_user_id,
            portfolio_id=portfolio.id,
            asset_id=asset.id,
            quantity=quantity,
            price=price,
            amount=total_amount,
            fee=fee,
            net_amount=net_amount,
            currency=portfolio.base_currency,
        )
        transaction.execute()
        holding = (
            db.session.query(PortfolioHolding)
            .filter(
                PortfolioHolding.portfolio_id == portfolio.id,
                PortfolioHolding.asset_id == asset.id,
                PortfolioHolding.is_active == True,
            )
            .first()
        )
        if holding:
            holding.add_shares(quantity, price)
        else:
            holding = PortfolioHolding(
                portfolio_id=portfolio.id,
                asset_id=asset.id,
                quantity=quantity,
                average_cost=price,
                cost_basis=total_amount,
                current_price=asset.current_price or price,
            )
            holding.update_valuation(current_price=asset.current_price or price)
            db.session.add(holding)
        portfolio.cash_balance -= net_amount
        portfolio.update_portfolio_metrics()
        transaction.complete()
        db.session.add(transaction)
        db.session.commit()
        audit_logger.log_financial_event(
            event_type=AuditEventType.TRADE_EXECUTED,
            user_id=g.current_user_id,
            details={
                "transaction_id": transaction.id,
                "portfolio_id": portfolio.id,
                "asset_symbol": asset.symbol,
                "transaction_type": "buy",
                "quantity": float(quantity),
                "price": float(price),
                "total_amount": float(total_amount),
            },
        )
        return (
            jsonify(
                {
                    "message": "Buy order executed successfully",
                    "transaction": _transaction_to_dict(transaction),
                    "holding": _holding_to_dict(holding),
                }
            ),
            201,
        )
    except ValidationError as e:
        return (jsonify({"error": e.message, "field": e.field}), 400)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to execute buy order"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/sell", methods=["POST"])
@jwt_required
@permission_required(Permission.EXECUTE_TRADE)
@rate_limit(limit=50, window=3600, scope=RateLimitScope.PER_USER)
def sell_asset(portfolio_id: Any) -> Any:
    """Sell an asset from the portfolio"""
    try:
        data = security_validator.validate_json_input(request.get_json())
        required_fields = ["asset_symbol", "quantity", "price"]
        for field in required_fields:
            if field not in data:
                return (jsonify({"error": f"{field} is required"}), 400)
        quantity = security_validator.validate_financial_amount(data["quantity"])
        price = security_validator.validate_financial_amount(data["price"])
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
                Portfolio.is_active == True,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)
        asset = (
            db.session.query(Asset)
            .filter(Asset.symbol == data["asset_symbol"].upper())
            .first()
        )
        if not asset:
            return (jsonify({"error": "Asset not found"}), 404)
        holding = (
            db.session.query(PortfolioHolding)
            .filter(
                PortfolioHolding.portfolio_id == portfolio.id,
                PortfolioHolding.asset_id == asset.id,
                PortfolioHolding.is_active == True,
            )
            .first()
        )
        if not holding:
            return (jsonify({"error": "No holding found for this asset"}), 404)
        if holding.quantity < quantity:
            return (jsonify({"error": "Insufficient shares to sell"}), 400)
        total_amount = quantity * price
        fee = total_amount * Decimal("0.001")
        net_amount = total_amount - fee
        transaction = Transaction(
            transaction_type=TransactionType.SELL,
            user_id=g.current_user_id,
            portfolio_id=portfolio.id,
            asset_id=asset.id,
            quantity=quantity,
            price=price,
            amount=total_amount,
            fee=fee,
            net_amount=net_amount,
            currency=portfolio.base_currency,
        )
        transaction.execute()
        realized_pnl = holding.remove_shares(quantity, price)
        portfolio.cash_balance += net_amount
        portfolio.realized_pnl = (portfolio.realized_pnl or Decimal("0")) + realized_pnl
        portfolio.update_portfolio_metrics()
        transaction.complete()
        db.session.add(transaction)
        db.session.commit()
        audit_logger.log_financial_event(
            event_type=AuditEventType.TRADE_EXECUTED,
            user_id=g.current_user_id,
            details={
                "transaction_id": transaction.id,
                "portfolio_id": portfolio.id,
                "asset_symbol": asset.symbol,
                "transaction_type": "sell",
                "quantity": float(quantity),
                "price": float(price),
                "total_amount": float(total_amount),
                "realized_pnl": float(realized_pnl),
            },
        )
        return (
            jsonify(
                {
                    "message": "Sell order executed successfully",
                    "transaction": _transaction_to_dict(transaction),
                    "holding": _holding_to_dict(holding) if holding.is_active else None,
                    "realized_pnl": float(realized_pnl),
                }
            ),
            201,
        )
    except ValidationError as e:
        return (jsonify({"error": e.message, "field": e.field}), 400)
    except Exception:
        db.session.rollback()
        return (jsonify({"error": "Failed to execute sell order"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/performance", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_PORTFOLIO)
def get_portfolio_performance(portfolio_id: Any) -> Any:
    """Get portfolio performance metrics"""
    try:
        days = request.args.get("days", 30, type=int)
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)

        current_value = float(portfolio.total_value or 0)
        total_return = float(
            (portfolio.realized_pnl or 0) + (portfolio.unrealized_pnl or 0)
        )
        invested = float(portfolio.invested_amount or 0)
        total_return_percent = total_return / invested * 100 if invested > 0 else 0

        performance = {
            "total_value": current_value,
            "invested_amount": invested,
            "cash_balance": float(portfolio.cash_balance or 0),
            "unrealized_pnl": float(portfolio.unrealized_pnl or 0),
            "realized_pnl": float(portfolio.realized_pnl or 0),
            "total_return": total_return,
            "total_return_percent": total_return_percent,
            "asset_allocation": portfolio.get_asset_allocation(),
            "risk_violations": portfolio.check_risk_limits(),
        }

        return (
            jsonify(
                {
                    "portfolio_id": portfolio.id,
                    "performance": performance,
                }
            ),
            200,
        )
    except Exception:
        return (jsonify({"error": "Failed to get portfolio performance"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/allocation", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_PORTFOLIO)
def get_portfolio_allocation(portfolio_id: Any) -> Any:
    """Get portfolio asset allocation breakdown"""
    try:
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)

        by_asset_type = portfolio.get_asset_allocation()
        by_asset = {}
        total_value = float(portfolio.total_value or 0)
        for holding in portfolio.holdings.filter_by(is_active=True):
            symbol = holding.asset.symbol if holding.asset else str(holding.asset_id)
            value = float(holding.current_value or 0)
            pct = value / total_value * 100 if total_value > 0 else 0
            by_asset[symbol] = {"value": value, "percentage": pct}

        return (
            jsonify(
                {
                    "portfolio_id": portfolio.id,
                    "allocation": {
                        "by_asset_type": by_asset_type,
                        "by_asset": by_asset,
                    },
                }
            ),
            200,
        )
    except Exception:
        return (jsonify({"error": "Failed to get allocation"}), 500)


@portfolio_bp.route("/<int:portfolio_id>/risk", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_PORTFOLIO)
def get_portfolio_risk(portfolio_id: Any) -> Any:
    """Get portfolio risk metrics"""
    try:
        portfolio = (
            db.session.query(Portfolio)
            .filter(
                Portfolio.id == portfolio_id,
                Portfolio.owner_id == g.current_user_id,
            )
            .first()
        )
        if not portfolio:
            return (jsonify({"error": "Portfolio not found"}), 404)

        violations = portfolio.check_risk_limits()
        risk_score = len(violations) * 20  # simple score
        float(portfolio.total_value or 0)
        invested = float(portfolio.invested_amount or 0)
        volatility = (
            abs(float(portfolio.unrealized_pnl or 0)) / invested * 100
            if invested > 0
            else 0
        )

        return (
            jsonify(
                {
                    "portfolio_id": portfolio.id,
                    "risk_metrics": {
                        "risk_score": min(risk_score, 100),
                        "volatility": volatility,
                        "risk_level": (
                            portfolio.risk_level.value if portfolio.risk_level else None
                        ),
                        "violations": violations,
                        "max_position_size": portfolio.max_position_size,
                        "max_sector_allocation": portfolio.max_sector_allocation,
                        "stop_loss_threshold": portfolio.stop_loss_threshold,
                    },
                }
            ),
            200,
        )
    except Exception:
        return (jsonify({"error": "Failed to get risk metrics"}), 500)


@portfolio_bp.route("/assets", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_MARKET_DATA)
def get_assets() -> Any:
    """Get all available tradeable assets"""
    try:
        asset_type_filter = request.args.get("asset_type")
        search = request.args.get("search", "").strip()
        limit = min(request.args.get("limit", 50, type=int), 200)

        query = db.session.query(Asset).filter(
            Asset.is_active == True, Asset.is_tradeable == True
        )
        if search:
            query = query.filter(
                Asset.symbol.ilike(f"%{search}%") | Asset.name.ilike(f"%{search}%")
            )
        if asset_type_filter:
            try:
                at = AssetType(asset_type_filter)
                query = query.filter(Asset.asset_type == at)
            except ValueError:
                pass
        assets = query.limit(limit).all()
        return (jsonify({"assets": [_asset_to_dict(a) for a in assets]}), 200)
    except Exception:
        return (jsonify({"error": "Failed to get assets"}), 500)


@portfolio_bp.route("/assets/search", methods=["GET"])
@jwt_required
@permission_required(Permission.READ_MARKET_DATA)
def search_assets() -> Any:
    """Search for tradeable assets"""
    try:
        query_str = request.args.get("q", "").strip()
        asset_type = request.args.get("type")
        limit = min(request.args.get("limit", 20, type=int), 100)
        if len(query_str) < 2:
            return (jsonify({"error": "Query must be at least 2 characters"}), 400)
        search_query = db.session.query(Asset).filter(
            Asset.is_active == True, Asset.is_tradeable == True
        )
        search_query = search_query.filter(
            Asset.symbol.ilike(f"%{query_str}%") | Asset.name.ilike(f"%{query_str}%")
        )
        if asset_type:
            try:
                at = AssetType(asset_type)
                search_query = search_query.filter(Asset.asset_type == at)
            except ValueError:
                pass
        assets = search_query.limit(limit).all()
        return (jsonify({"assets": [_asset_to_dict(a) for a in assets]}), 200)
    except Exception:
        return (jsonify({"error": "Failed to search assets"}), 500)
