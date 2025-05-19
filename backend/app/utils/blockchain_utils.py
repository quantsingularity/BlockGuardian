"""
Blockchain utility functions for the BlockGuardian application.
This module provides common blockchain-related functionality used across the application.
"""

import os
import json
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class BlockchainUtils:
    """Utility class for blockchain operations."""
    
    def __init__(self, provider_url=None):
        """
        Initialize blockchain utilities with a provider URL.
        
        Args:
            provider_url (str, optional): The blockchain provider URL. 
                                         Defaults to environment variable.
        """
        self.provider_url = provider_url or os.getenv("BLOCKCHAIN_PROVIDER_URL")
        self.web3 = Web3(Web3.HTTPProvider(self.provider_url))
        
    def is_connected(self):
        """Check if connected to the blockchain."""
        return self.web3.is_connected()
    
    def get_latest_block(self):
        """Get the latest block from the blockchain."""
        return self.web3.eth.get_block('latest')
    
    def get_transaction(self, tx_hash):
        """
        Get transaction details by hash.
        
        Args:
            tx_hash (str): Transaction hash
            
        Returns:
            dict: Transaction details
        """
        tx_hash_bytes = self.web3.to_bytes(hexstr=tx_hash)
        return self.web3.eth.get_transaction(tx_hash_bytes)
    
    def get_transaction_receipt(self, tx_hash):
        """
        Get transaction receipt by hash.
        
        Args:
            tx_hash (str): Transaction hash
            
        Returns:
            dict: Transaction receipt
        """
        tx_hash_bytes = self.web3.to_bytes(hexstr=tx_hash)
        return self.web3.eth.get_transaction_receipt(tx_hash_bytes)
    
    def get_contract(self, address, abi):
        """
        Get contract instance at the specified address.
        
        Args:
            address (str): Contract address
            abi (list): Contract ABI
            
        Returns:
            Contract: Web3 contract instance
        """
        return self.web3.eth.contract(address=address, abi=abi)
    
    def load_contract_abi(self, contract_name):
        """
        Load contract ABI from artifacts.
        
        Args:
            contract_name (str): Name of the contract
            
        Returns:
            list: Contract ABI
        """
        # Assuming artifacts are stored in a standard location
        artifacts_dir = os.path.join(os.path.dirname(__file__), '../../blockchain-contracts/artifacts/contracts')
        contract_file = f"{contract_name}.json"
        
        try:
            with open(os.path.join(artifacts_dir, contract_file), 'r') as f:
                contract_json = json.load(f)
                return contract_json['abi']
        except FileNotFoundError:
            raise FileNotFoundError(f"Contract artifact not found: {contract_name}")
    
    def sign_transaction(self, transaction, private_key):
        """
        Sign a transaction with a private key.
        
        Args:
            transaction (dict): Transaction to sign
            private_key (str): Private key to sign with
            
        Returns:
            SignedTransaction: Signed transaction
        """
        return self.web3.eth.account.sign_transaction(transaction, private_key)
    
    def send_raw_transaction(self, signed_transaction):
        """
        Send a signed transaction to the blockchain.
        
        Args:
            signed_transaction (SignedTransaction): Signed transaction
            
        Returns:
            str: Transaction hash
        """
        tx_hash = self.web3.eth.send_raw_transaction(signed_transaction.rawTransaction)
        return self.web3.to_hex(tx_hash)
    
    def wait_for_transaction_receipt(self, tx_hash, timeout=120):
        """
        Wait for transaction receipt.
        
        Args:
            tx_hash (str): Transaction hash
            timeout (int, optional): Timeout in seconds. Defaults to 120.
            
        Returns:
            dict: Transaction receipt
        """
        tx_hash_bytes = self.web3.to_bytes(hexstr=tx_hash)
        return self.web3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=timeout)
    
    @staticmethod
    def generate_wallet():
        """
        Generate a new Ethereum wallet.
        
        Returns:
            tuple: (address, private_key)
        """
        account = Account.create()
        return account.address, account.key.hex()
