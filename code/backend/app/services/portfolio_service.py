/**
 * Portfolio service for managing user portfolios
 */

from datetime import datetime
from sqlalchemy.exc import IntegrityError

from app.models.models import Portfolio, Asset, Transaction
from app.db.database import db
from app.core.blockchain import BlockchainUtils

class PortfolioService:
    """Service for portfolio management"""
    
    @staticmethod
    def get_user_portfolios(user_id):
        """Get all portfolios for a user"""
        try:
            portfolios = Portfolio.query.filter_by(user_id=user_id).all()
            
            result = []
            for portfolio in portfolios:
                # Calculate total value
                total_value = 0
                assets = Asset.query.filter_by(portfolio_id=portfolio.id).all()
                for asset in assets:
                    total_value += asset.current_value
                
                result.append({
                    'id': portfolio.id,
                    'name': portfolio.name,
                    'description': portfolio.description,
                    'total_value': total_value,
                    'asset_count': len(assets),
                    'created_at': portfolio.created_at.isoformat(),
                    'updated_at': portfolio.updated_at.isoformat()
                })
            
            return {'portfolios': result}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_portfolio_details(portfolio_id, user_id):
        """Get detailed information for a portfolio"""
        try:
            # Check if portfolio exists and belongs to user
            portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
            if not portfolio:
                return {'error': 'Portfolio not found'}, 404
            
            # Get assets in portfolio
            assets = Asset.query.filter_by(portfolio_id=portfolio_id).all()
            
            # Format assets
            asset_list = []
            total_value = 0
            
            for asset in assets:
                asset_data = {
                    'id': asset.id,
                    'name': asset.name,
                    'symbol': asset.symbol,
                    'type': asset.type,
                    'quantity': asset.quantity,
                    'purchase_price': asset.purchase_price,
                    'current_price': asset.current_price,
                    'current_value': asset.current_value,
                    'profit_loss': asset.current_value - (asset.purchase_price * asset.quantity),
                    'profit_loss_percentage': ((asset.current_price / asset.purchase_price) - 1) * 100 if asset.purchase_price > 0 else 0,
                    'address': asset.address,
                    'network_id': asset.network_id,
                    'created_at': asset.created_at.isoformat(),
                    'updated_at': asset.updated_at.isoformat()
                }
                
                asset_list.append(asset_data)
                total_value += asset.current_value
            
            # Get recent transactions
            transactions = Transaction.query.filter_by(portfolio_id=portfolio_id).order_by(Transaction.timestamp.desc()).limit(10).all()
            
            transaction_list = []
            for tx in transactions:
                transaction_list.append({
                    'id': tx.id,
                    'type': tx.type,
                    'asset_name': tx.asset_name,
                    'asset_symbol': tx.asset_symbol,
                    'quantity': tx.quantity,
                    'price': tx.price,
                    'total_value': tx.total_value,
                    'timestamp': tx.timestamp.isoformat(),
                    'tx_hash': tx.tx_hash,
                    'network_id': tx.network_id
                })
            
            return {
                'portfolio': {
                    'id': portfolio.id,
                    'name': portfolio.name,
                    'description': portfolio.description,
                    'total_value': total_value,
                    'created_at': portfolio.created_at.isoformat(),
                    'updated_at': portfolio.updated_at.isoformat(),
                    'assets': asset_list,
                    'recent_transactions': transaction_list
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def create_portfolio(user_id, name, description=None):
        """Create a new portfolio"""
        try:
            # Create new portfolio
            new_portfolio = Portfolio(
                user_id=user_id,
                name=name,
                description=description,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Save to database
            db.session.add(new_portfolio)
            db.session.commit()
            
            return {
                'portfolio': {
                    'id': new_portfolio.id,
                    'name': new_portfolio.name,
                    'description': new_portfolio.description,
                    'created_at': new_portfolio.created_at.isoformat()
                }
            }, 201
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Database error occurred'}, 500
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_portfolio(portfolio_id, user_id, portfolio_data):
        """Update portfolio information"""
        try:
            # Check if portfolio exists and belongs to user
            portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
            if not portfolio:
                return {'error': 'Portfolio not found'}, 404
            
            # Update fields
            if 'name' in portfolio_data:
                portfolio.name = portfolio_data['name']
            
            if 'description' in portfolio_data:
                portfolio.description = portfolio_data['description']
            
            # Update timestamp
            portfolio.updated_at = datetime.utcnow()
            
            # Save changes
            db.session.commit()
            
            return {
                'portfolio': {
                    'id': portfolio.id,
                    'name': portfolio.name,
                    'description': portfolio.description,
                    'updated_at': portfolio.updated_at.isoformat()
                }
            }, 200
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Database error occurred'}, 500
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_portfolio(portfolio_id, user_id):
        """Delete a portfolio"""
        try:
            # Check if portfolio exists and belongs to user
            portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
            if not portfolio:
                return {'error': 'Portfolio not found'}, 404
            
            # Delete portfolio (cascade will delete assets and transactions)
            db.session.delete(portfolio)
            db.session.commit()
            
            return {
                'message': 'Portfolio deleted successfully'
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def add_asset(portfolio_id, user_id, asset_data):
        """Add an asset to a portfolio"""
        try:
            # Check if portfolio exists and belongs to user
            portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
            if not portfolio:
                return {'error': 'Portfolio not found'}, 404
            
            # Create new asset
            new_asset = Asset(
                portfolio_id=portfolio_id,
                name=asset_data['name'],
                symbol=asset_data['symbol'],
                type=asset_data['type'],
                quantity=asset_data['quantity'],
                purchase_price=asset_data['purchase_price'],
                current_price=asset_data['current_price'] if 'current_price' in asset_data else asset_data['purchase_price'],
                current_value=asset_data['quantity'] * asset_data['purchase_price'],
                address=asset_data.get('address'),
                network_id=asset_data.get('network_id'),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Save to database
            db.session.add(new_asset)
            
            # Create transaction record
            new_transaction = Transaction(
                portfolio_id=portfolio_id,
                type='buy',
                asset_name=asset_data['name'],
                asset_symbol=asset_data['symbol'],
                quantity=asset_data['quantity'],
                price=asset_data['purchase_price'],
                total_value=asset_data['quantity'] * asset_data['purchase_price'],
                timestamp=datetime.utcnow(),
                tx_hash=asset_data.get('tx_hash'),
                network_id=asset_data.get('network_id')
            )
            
            # Save transaction
            db.session.add(new_transaction)
            
            # Update portfolio timestamp
            portfolio.updated_at = datetime.utcnow()
            
            # Commit all changes
            db.session.commit()
            
            return {
                'asset': {
                    'id': new_asset.id,
                    'name': new_asset.name,
                    'symbol': new_asset.symbol,
                    'type': new_asset.type,
                    'quantity': new_asset.quantity,
                    'purchase_price': new_asset.purchase_price,
                    'current_value': new_asset.current_value,
                    'created_at': new_asset.created_at.isoformat()
                }
            }, 201
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Database error occurred'}, 500
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
