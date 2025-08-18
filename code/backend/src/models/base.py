"""
Base database models and utilities for BlockGuardian Backend
Implements enterprise-grade database patterns with audit trails and encryption
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.event import listens_for
from flask import g, has_request_context

from src.config import current_config
from src.security.encryption import encryption_manager
from src.security.audit import audit_logger, AuditEventType, AuditSeverity


class BaseModel:
    """Base model with common fields and functionality"""
    
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(Integer, nullable=True)  # User ID who created the record
    updated_by = Column(Integer, nullable=True)  # User ID who last updated the record
    is_active = Column(Boolean, default=True, nullable=False)
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert model to dictionary"""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            
            # Handle datetime serialization
            if isinstance(value, datetime):
                value = value.isoformat()
            
            # Handle encrypted fields
            if hasattr(self, '_encrypted_fields') and column.name in self._encrypted_fields:
                if include_sensitive:
                    # Decrypt for authorized access
                    value = encryption_manager.decrypt_field(value)
                else:
                    # Mask sensitive data
                    value = "***ENCRYPTED***"
            
            result[column.name] = value
        
        return result
    
    def update_from_dict(self, data: Dict[str, Any], exclude_fields: list = None):
        """Update model from dictionary"""
        if exclude_fields is None:
            exclude_fields = ['id', 'created_at', 'created_by']
        
        for key, value in data.items():
            if key not in exclude_fields and hasattr(self, key):
                # Handle encrypted fields
                if hasattr(self, '_encrypted_fields') and key in self._encrypted_fields:
                    value = encryption_manager.encrypt_field(value)
                
                setattr(self, key, value)
        
        # Update metadata
        self.updated_at = datetime.utcnow()
        if has_request_context() and hasattr(g, 'current_user_id'):
            self.updated_by = g.current_user_id
    
    def soft_delete(self):
        """Soft delete the record"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
        if has_request_context() and hasattr(g, 'current_user_id'):
            self.updated_by = g.current_user_id


# Create declarative base
Base = declarative_base(cls=BaseModel)


class DatabaseManager:
    """Enterprise database manager with connection pooling and monitoring"""
    
    def __init__(self, app=None):
        self.app = app
        self.engine = None
        self.session_factory = None
        self.Session = None
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize database manager with Flask app"""
        self.app = app
        
        # Create database engine with connection pooling
        db_config = current_config.database
        
        self.engine = create_engine(
            db_config.uri,
            pool_size=db_config.pool_size,
            max_overflow=db_config.max_overflow,
            pool_timeout=db_config.pool_timeout,
            pool_recycle=db_config.pool_recycle,
            echo=db_config.echo,
            echo_pool=db_config.echo_pool
        )
        
        # Create session factory
        self.session_factory = sessionmaker(bind=self.engine)
        self.Session = scoped_session(self.session_factory)
        
        # Create all tables
        Base.metadata.create_all(self.engine)
        
        # Set up event listeners for audit logging
        self._setup_audit_listeners()
        
        app.logger.info("Database manager initialized")
    
    def get_session(self):
        """Get database session"""
        return self.Session()
    
    def close_session(self):
        """Close database session"""
        self.Session.remove()
    
    def _setup_audit_listeners(self):
        """Set up SQLAlchemy event listeners for audit logging"""
        
        @listens_for(self.Session, 'after_insert')
        def log_insert(mapper, connection, target):
            """Log record creation"""
            if hasattr(target, '__tablename__'):
                audit_logger.log_data_access(
                    action='create',
                    resource=target.__tablename__,
                    details={
                        'table': target.__tablename__,
                        'record_id': getattr(target, 'id', None),
                        'operation': 'insert'
                    }
                )
        
        @listens_for(self.Session, 'after_update')
        def log_update(mapper, connection, target):
            """Log record updates"""
            if hasattr(target, '__tablename__'):
                # Get changed fields
                changed_fields = []
                for attr in mapper.attrs:
                    hist = getattr(target, attr.key + '_history', None)
                    if hist and hist.has_changes():
                        changed_fields.append(attr.key)
                
                audit_logger.log_data_access(
                    action='update',
                    resource=target.__tablename__,
                    details={
                        'table': target.__tablename__,
                        'record_id': getattr(target, 'id', None),
                        'operation': 'update',
                        'changed_fields': changed_fields
                    }
                )
        
        @listens_for(self.Session, 'after_delete')
        def log_delete(mapper, connection, target):
            """Log record deletions"""
            if hasattr(target, '__tablename__'):
                audit_logger.log_data_access(
                    action='delete',
                    resource=target.__tablename__,
                    details={
                        'table': target.__tablename__,
                        'record_id': getattr(target, 'id', None),
                        'operation': 'delete'
                    }
                )


# Global database manager instance
db_manager = DatabaseManager()


class AuditMixin:
    """Mixin for models that require detailed audit trails"""
    
    audit_log = Column(Text)  # JSON field for storing audit information
    
    def add_audit_entry(self, action: str, details: Dict[str, Any] = None, user_id: int = None):
        """Add audit entry to the model"""
        if user_id is None and has_request_context() and hasattr(g, 'current_user_id'):
            user_id = g.current_user_id
        
        audit_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'action': action,
            'user_id': user_id,
            'details': details or {}
        }
        
        # Get existing audit log
        import json
        try:
            audit_log = json.loads(self.audit_log) if self.audit_log else []
        except (json.JSONDecodeError, TypeError):
            audit_log = []
        
        # Add new entry
        audit_log.append(audit_entry)
        
        # Keep only last 100 entries to prevent unbounded growth
        if len(audit_log) > 100:
            audit_log = audit_log[-100:]
        
        # Store updated audit log
        self.audit_log = json.dumps(audit_log)
    
    def get_audit_trail(self) -> list:
        """Get audit trail for the model"""
        import json
        try:
            return json.loads(self.audit_log) if self.audit_log else []
        except (json.JSONDecodeError, TypeError):
            return []


class EncryptedMixin:
    """Mixin for models with encrypted fields"""
    
    _encrypted_fields = []  # Override in subclasses
    
    def encrypt_field(self, field_name: str, value: str, field_type: str = "general") -> str:
        """Encrypt a field value"""
        return encryption_manager.encrypt_field(value, field_type)
    
    def decrypt_field(self, field_name: str, encrypted_value: str) -> str:
        """Decrypt a field value"""
        return encryption_manager.decrypt_field(encrypted_value)
    
    def set_encrypted_field(self, field_name: str, value: str, field_type: str = "general"):
        """Set an encrypted field value"""
        if field_name in self._encrypted_fields:
            encrypted_value = self.encrypt_field(field_name, value, field_type)
            setattr(self, field_name, encrypted_value)
        else:
            setattr(self, field_name, value)
    
    def get_encrypted_field(self, field_name: str) -> str:
        """Get a decrypted field value"""
        if field_name in self._encrypted_fields:
            encrypted_value = getattr(self, field_name)
            return self.decrypt_field(field_name, encrypted_value)
        else:
            return getattr(self, field_name)


class TimestampMixin:
    """Mixin for models with detailed timestamp tracking"""
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    @property
    def is_deleted(self) -> bool:
        """Check if record is soft deleted"""
        return self.deleted_at is not None
    
    def soft_delete(self):
        """Soft delete the record"""
        self.deleted_at = datetime.utcnow()
        self.is_active = False


class VersionMixin:
    """Mixin for models with version tracking"""
    
    version = Column(Integer, default=1, nullable=False)
    
    def increment_version(self):
        """Increment version number"""
        self.version += 1


# Utility functions for database operations
def get_or_create(session, model, defaults=None, **kwargs):
    """Get existing record or create new one"""
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    else:
        params = dict((k, v) for k, v in kwargs.items())
        if defaults:
            params.update(defaults)
        instance = model(**params)
        session.add(instance)
        return instance, True


def bulk_insert_or_update(session, model, data_list, update_fields=None):
    """Bulk insert or update records"""
    if not data_list:
        return
    
    # Use SQLAlchemy bulk operations for better performance
    if update_fields:
        # Bulk update
        session.bulk_update_mappings(model, data_list)
    else:
        # Bulk insert
        session.bulk_insert_mappings(model, data_list)


def paginate_query(query, page: int = 1, per_page: int = 20, max_per_page: int = 100):
    """Paginate SQLAlchemy query"""
    if per_page > max_per_page:
        per_page = max_per_page
    
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'items': items,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page,
        'has_prev': page > 1,
        'has_next': page * per_page < total
    }

