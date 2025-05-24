"""
Database utility functions for the BlockGuardian application.
This module provides common database-related functionality used across the application.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection settings
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blockguardian.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class DBUtils:
    """Utility class for database operations."""
    
    @staticmethod
    def get_db():
        """
        Get database session.
        
        Yields:
            Session: Database session
        """
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    @staticmethod
    def create_tables():
        """Create all tables defined in models."""
        Base.metadata.create_all(bind=engine)
    
    @staticmethod
    def drop_tables():
        """Drop all tables defined in models."""
        Base.metadata.drop_all(bind=engine)
    
    @staticmethod
    def execute_raw_sql(sql, params=None):
        """
        Execute raw SQL query.
        
        Args:
            sql (str): SQL query
            params (dict, optional): Query parameters. Defaults to None.
            
        Returns:
            Result: Query result
        """
        with engine.connect() as connection:
            if params:
                result = connection.execute(sql, params)
            else:
                result = connection.execute(sql)
            return result
