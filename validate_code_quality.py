#!/usr/bin/env python3
"""
Code Quality and Security Checks

This script runs various code quality and security checks on the BlockGuardian codebase.
It includes linting, static analysis, and security scanning for both backend and smart contracts.
"""

import json
import os
import subprocess
import sys
from pathlib import Path


def run_command(command, cwd=None):
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
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, f"Error: {e.stderr}"


def check_python_code():
    """Run linting and static analysis on Python code."""
    print("Checking Python code quality...")

    # Install required packages if not already installed
    run_command("pip install flake8 bandit safety")

    # Run flake8 for linting
    print("\n=== Running Flake8 ===")
    success, output = run_command(
        "flake8 --max-line-length=100 --exclude=venv,__pycache__ .", cwd="backend"
    )
    print(output if output else "No linting issues found.")

    # Run bandit for security issues
    print("\n=== Running Bandit Security Analysis ===")
    success, output = run_command("bandit -r -f txt -ll .", cwd="backend")
    print(output)

    # Check dependencies for vulnerabilities
    print("\n=== Checking Dependencies for Vulnerabilities ===")
    success, output = run_command("safety check -r requirements.txt", cwd="backend")
    print(output)

    return success


def check_smart_contracts():
    """Run security analysis on smart contracts."""
    print("\nChecking smart contract security...")

    # Install required packages if not already installed
    run_command("npm install -g solhint")

    # Run solhint for linting
    print("\n=== Running Solhint ===")
    success, output = run_command(
        "solhint 'contracts/**/*.sol'", cwd="blockchain-contracts"
    )
    print(output if output else "No linting issues found.")

    # Check if slither is installed, if not suggest installation
    print("\n=== Slither Analysis ===")
    slither_installed, _ = run_command("pip show slither-analyzer")
    if not slither_installed:
        print("Slither not installed. To install: pip install slither-analyzer")
        print("Skipping Slither analysis.")
    else:
        success, output = run_command("slither .", cwd="blockchain-contracts")
        print(output)

    return success


def main():
    """Main function to run all checks."""
    print("Starting code quality and security validation...")

    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("blockchain-contracts"):
        print("Error: Script must be run from the BlockGuardian root directory.")
        return False

    # Run Python code checks
    python_success = check_python_code()

    # Run smart contract checks
    contract_success = check_smart_contracts()

    # Generate report
    print("\n=== Validation Summary ===")
    if python_success and contract_success:
        print("All checks passed successfully!")
    else:
        print("Some checks failed. Please review the output above.")

    return python_success and contract_success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
