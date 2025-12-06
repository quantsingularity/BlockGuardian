"""
Code Quality and Security Checks

This script runs various code quality and security checks on the BlockGuardian codebase.
It includes linting, static analysis, and security scanning for both backend and smart contracts.
"""

import os
import subprocess
import sys
from core.logging import get_logger

logger = get_logger(__name__)


def run_command(command: Any, cwd: Any = None) -> Any:
    """Run a shell command and return the output."""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            check=True,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return (True, result.stdout)
    except subprocess.CalledProcessError as e:
        return (False, f"Error: {e.stderr}")


def check_python_code() -> Any:
    """Run linting and static analysis on Python code."""
    logger.info("Checking Python code quality...")
    run_command("pip install flake8 bandit safety")
    logger.info("\n=== Running Flake8 ===")
    success, output = run_command(
        "flake8 --max-line-length=100 --exclude=venv,__pycache__ .", cwd="backend"
    )
    logger.info(output if output else "No linting issues found.")
    logger.info("\n=== Running Bandit Security Analysis ===")
    success, output = run_command("bandit -r -f txt -ll .", cwd="backend")
    logger.info(output)
    logger.info("\n=== Checking Dependencies for Vulnerabilities ===")
    success, output = run_command("safety check -r requirements.txt", cwd="backend")
    logger.info(output)
    return success


def check_smart_contracts() -> Any:
    """Run security analysis on smart contracts."""
    logger.info("\nChecking smart contract security...")
    run_command("npm install -g solhint")
    logger.info("\n=== Running Solhint ===")
    success, output = run_command(
        "solhint 'contracts/**/*.sol'", cwd="blockchain-contracts"
    )
    logger.info(output if output else "No linting issues found.")
    logger.info("\n=== Slither Analysis ===")
    slither_installed, _ = run_command("pip show slither-analyzer")
    if not slither_installed:
        logger.info("Slither not installed. To install: pip install slither-analyzer")
        logger.info("Skipping Slither analysis.")
    else:
        success, output = run_command("slither .", cwd="blockchain-contracts")
        logger.info(output)
    return success


def main() -> Any:
    """Main function to run all checks."""
    logger.info("Starting code quality and security validation...")
    if not os.path.exists("backend") or not os.path.exists("blockchain-contracts"):
        logger.info("Error: Script must be run from the BlockGuardian root directory.")
        return False
    python_success = check_python_code()
    contract_success = check_smart_contracts()
    logger.info("\n=== Validation Summary ===")
    if python_success and contract_success:
        logger.info("All checks passed successfully!")
    else:
        logger.info("Some checks failed. Please review the output above.")
    return python_success and contract_success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
