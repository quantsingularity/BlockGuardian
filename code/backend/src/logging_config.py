"""
Logging configuration for BlockGuardian Backend
"""

import logging


def get_logger(name: str) -> logging.Logger:
    """Get or create a logger with the given name"""
    return logging.getLogger(name)
