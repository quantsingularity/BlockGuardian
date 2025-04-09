// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AnomalyDetection.sol";

/**
 * @title TransactionMonitor
 * @dev Smart contract for monitoring blockchain transactions and detecting fraud
 */
contract TransactionMonitor {
    address public owner;
    AnomalyDetection public anomalyDetection;
    
    // Structure to store transaction details
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
        uint256 riskScore;
        bool flagged;
    }
    
    // Array to store all monitored transactions
    Transaction[] public transactions;
    
    // Mapping to track transactions by address
    mapping(address => uint256[]) public addressToTransactions;
    
    // Events
    event TransactionMonitored(
        uint256 indexed transactionId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 riskScore,
        bool flagged
    );
    
    event HighRiskTransactionDetected(
        uint256 indexed transactionId,
        address sender,
        address receiver,
        uint256 amount,
        uint256 riskScore
    );
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor(address _anomalyDetectionAddress) {
        owner = msg.sender;
        anomalyDetection = AnomalyDetection(_anomalyDetectionAddress);
    }
    
    /**
     * @dev Monitor a transaction and check for anomalies
     * @param _sender Sender address
     * @param _receiver Receiver address
     * @param _amount Transaction amount
     * @return Transaction ID and risk score
     */
    function monitorTransaction(
        address _sender,
        address _receiver,
        uint256 _amount
    ) external returns (uint256, uint256) {
        // Check transaction using AnomalyDetection contract
        uint256 riskScore = anomalyDetection.checkTransaction(_sender, _receiver, _amount);
        
        // Determine if transaction should be flagged
        bool flagged = riskScore > 70;
        
        // Create and store transaction
        Transaction memory newTx = Transaction({
            sender: _sender,
            receiver: _receiver,
            amount: _amount,
            timestamp: block.timestamp,
            riskScore: riskScore,
            flagged: flagged
        });
        
        transactions.push(newTx);
        uint256 txId = transactions.length - 1;
        
        // Update address to transactions mapping
        addressToTransactions[_sender].push(txId);
        addressToTransactions[_receiver].push(txId);
        
        // Emit events
        emit TransactionMonitored(
            txId,
            _sender,
            _receiver,
            _amount,
            riskScore,
            flagged
        );
        
        if (flagged) {
            emit HighRiskTransactionDetected(
                txId,
                _sender,
                _receiver,
                _amount,
                riskScore
            );
        }
        
        return (txId, riskScore);
    }
    
    /**
     * @dev Get transaction details by ID
     * @param _txId Transaction ID
     * @return Transaction details
     */
    function getTransaction(uint256 _txId) external view returns (
        address sender,
        address receiver,
        uint256 amount,
        uint256 timestamp,
        uint256 riskScore,
        bool flagged
    ) {
        require(_txId < transactions.length, "Transaction does not exist");
        
        Transaction memory tx = transactions[_txId];
        return (
            tx.sender,
            tx.receiver,
            tx.amount,
            tx.timestamp,
            tx.riskScore,
            tx.flagged
        );
    }
    
    /**
     * @dev Get all transaction IDs for an address
     * @param _address Address to query
     * @return Array of transaction IDs
     */
    function getAddressTransactions(address _address) external view returns (uint256[] memory) {
        return addressToTransactions[_address];
    }
    
    /**
     * @dev Get total number of transactions
     * @return Total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @dev Set the AnomalyDetection contract address
     * @param _anomalyDetectionAddress New AnomalyDetection contract address
     */
    function setAnomalyDetection(address _anomalyDetectionAddress) external onlyOwner {
        require(_anomalyDetectionAddress != address(0), "Invalid address");
        anomalyDetection = AnomalyDetection(_anomalyDetectionAddress);
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
