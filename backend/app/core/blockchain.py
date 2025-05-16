/**
 * Core utilities for blockchain interactions
 */

import os
import json
import requests
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
from hexbytes import HexBytes

from app.core.config import Config

class BlockchainUtils:
    """Utility class for blockchain interactions"""
    
    @staticmethod
    def get_web3_provider(network_id):
        """Get Web3 provider for a specific network"""
        # Find network by ID
        network = None
        for net in Config.BLOCKCHAIN_NETWORKS.values():
            if net['id'] == network_id:
                network = net
                break
        
        if not network:
            raise ValueError(f"Network with ID {network_id} not found")
        
        # Create Web3 provider
        return Web3(Web3.HTTPProvider(network['rpc_url']))
    
    @staticmethod
    def get_address_balance(address, network_id):
        """Get native token balance for an address"""
        w3 = BlockchainUtils.get_web3_provider(network_id)
        
        try:
            # Check if address is valid
            if not w3.is_address(address):
                raise ValueError("Invalid address")
            
            # Get balance in wei
            balance_wei = w3.eth.get_balance(address)
            
            # Convert to ether
            balance_eth = w3.from_wei(balance_wei, 'ether')
            
            return {
                'address': address,
                'network_id': network_id,
                'balance': str(balance_eth),
                'balance_wei': str(balance_wei)
            }
        except Exception as e:
            raise Exception(f"Error getting balance: {str(e)}")
    
    @staticmethod
    def get_transaction(tx_hash, network_id):
        """Get transaction details"""
        w3 = BlockchainUtils.get_web3_provider(network_id)
        
        try:
            # Convert string hash to bytes if needed
            if isinstance(tx_hash, str):
                tx_hash = HexBytes(tx_hash)
            
            # Get transaction
            tx = w3.eth.get_transaction(tx_hash)
            
            # Get transaction receipt
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            
            # Format transaction data
            tx_data = {
                'hash': tx['hash'].hex(),
                'from': tx['from'],
                'to': tx['to'],
                'value': str(w3.from_wei(tx['value'], 'ether')),
                'gas': tx['gas'],
                'gas_price': str(w3.from_wei(tx['gasPrice'], 'gwei')),
                'nonce': tx['nonce'],
                'block_number': tx['blockNumber'],
                'block_hash': tx['blockHash'].hex() if tx['blockHash'] else None,
                'status': receipt['status'] if receipt else None,
                'gas_used': receipt['gasUsed'] if receipt else None,
                'timestamp': None  # Will be filled below
            }
            
            # Get block timestamp if transaction is mined
            if tx['blockNumber']:
                block = w3.eth.get_block(tx['blockNumber'])
                tx_data['timestamp'] = block['timestamp']
            
            return tx_data
        except Exception as e:
            raise Exception(f"Error getting transaction: {str(e)}")
    
    @staticmethod
    def get_token_balance(token_address, wallet_address, network_id):
        """Get ERC20 token balance for an address"""
        w3 = BlockchainUtils.get_web3_provider(network_id)
        
        # ERC20 ABI for balanceOf function
        abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "name",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            }
        ]
        
        try:
            # Create contract instance
            token_contract = w3.eth.contract(address=token_address, abi=abi)
            
            # Get token balance
            balance = token_contract.functions.balanceOf(wallet_address).call()
            
            # Get token decimals
            decimals = token_contract.functions.decimals().call()
            
            # Get token symbol
            symbol = token_contract.functions.symbol().call()
            
            # Get token name
            name = token_contract.functions.name().call()
            
            # Calculate balance with decimals
            balance_with_decimals = balance / (10 ** decimals)
            
            return {
                'token_address': token_address,
                'wallet_address': wallet_address,
                'balance': str(balance),
                'balance_formatted': str(balance_with_decimals),
                'decimals': decimals,
                'symbol': symbol,
                'name': name
            }
        except Exception as e:
            raise Exception(f"Error getting token balance: {str(e)}")
    
    @staticmethod
    def verify_signature(message, signature, address):
        """Verify a message signature"""
        try:
            w3 = Web3()
            
            # Encode the message
            message_hash = encode_defunct(text=message)
            
            # Recover the address from the signature
            recovered_address = Account.recover_message(message_hash, signature=signature)
            
            # Check if the recovered address matches the expected address
            return recovered_address.lower() == address.lower()
        except Exception as e:
            raise Exception(f"Error verifying signature: {str(e)}")
    
    @staticmethod
    def get_gas_price(network_id):
        """Get current gas price for a network"""
        w3 = BlockchainUtils.get_web3_provider(network_id)
        
        try:
            # Get gas price in wei
            gas_price_wei = w3.eth.gas_price
            
            # Convert to gwei
            gas_price_gwei = w3.from_wei(gas_price_wei, 'gwei')
            
            return {
                'network_id': network_id,
                'gas_price_wei': str(gas_price_wei),
                'gas_price_gwei': str(gas_price_gwei)
            }
        except Exception as e:
            raise Exception(f"Error getting gas price: {str(e)}")
