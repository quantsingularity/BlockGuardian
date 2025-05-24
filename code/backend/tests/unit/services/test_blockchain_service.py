import pytest
from unittest.mock import patch, MagicMock
from app.services.blockchain_service import BlockchainService

def test_connect_to_blockchain():
    """Test blockchain connection functionality."""
    blockchain_service = BlockchainService()
    with patch.object(blockchain_service, '_establish_connection', return_value=True):
        result = blockchain_service.connect()
        assert result is True

def test_get_transaction_by_hash():
    """Test retrieving transaction by hash."""
    blockchain_service = BlockchainService()
    mock_tx = {
        "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "from": "0xabcdef1234567890abcdef1234567890abcdef12",
        "to": "0x1234567890abcdef1234567890abcdef1234567890",
        "value": "0.1",
        "gas": 21000,
        "gasPrice": "20000000000",
        "nonce": 1,
        "blockHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "blockNumber": 12345678,
        "transactionIndex": 0
    }
    
    with patch.object(blockchain_service, 'get_transaction', return_value=mock_tx):
        tx = blockchain_service.get_transaction("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
        assert tx["hash"] == mock_tx["hash"]
        assert tx["from"] == mock_tx["from"]
        assert tx["to"] == mock_tx["to"]

def test_send_transaction():
    """Test sending a transaction to the blockchain."""
    blockchain_service = BlockchainService()
    tx_data = {
        "to": "0x1234567890abcdef1234567890abcdef1234567890",
        "value": "0.1",
        "gas": 21000,
        "gasPrice": "20000000000",
        "nonce": 1,
        "data": "0x"
    }
    
    expected_tx_hash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    
    with patch.object(blockchain_service, 'send_transaction', return_value=expected_tx_hash):
        tx_hash = blockchain_service.send_transaction(tx_data)
        assert tx_hash == expected_tx_hash

def test_get_contract_events():
    """Test retrieving events from a smart contract."""
    blockchain_service = BlockchainService()
    contract_address = "0xabcdef1234567890abcdef1234567890abcdef12"
    mock_events = [
        {
            "event": "Transfer",
            "address": contract_address,
            "returnValues": {
                "from": "0x0000000000000000000000000000000000000000",
                "to": "0xabcdef1234567890abcdef1234567890abcdef12",
                "value": "1000000000000000000"
            },
            "blockNumber": 12345678,
            "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            "logIndex": 0
        }
    ]
    
    with patch.object(blockchain_service, 'get_contract_events', return_value=mock_events):
        events = blockchain_service.get_contract_events(contract_address)
        assert len(events) == 1
        assert events[0]["event"] == "Transfer"
        assert events[0]["address"] == contract_address
