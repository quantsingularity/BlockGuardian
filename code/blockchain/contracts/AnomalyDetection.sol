// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AnomalyDetection
 * @dev Smart contract for detecting anomalies in blockchain transactions
 */
contract AnomalyDetection {
    address public owner;
    
    // Mapping to store risk scores for addresses
    mapping(address => uint256) public riskScores;
    
    // Event emitted when an anomaly is detected
    event AnomalyDetected(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 riskScore,
        uint256 timestamp
    );
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Set risk score for an address
     * @param _address Address to set risk score for
     * @param _score Risk score (0-100)
     */
    function setRiskScore(address _address, uint256 _score) external onlyOwner {
        require(_score <= 100, "Score must be between 0 and 100");
        riskScores[_address] = _score;
    }
    
    /**
     * @dev Get risk score for an address
     * @param _address Address to get risk score for
     * @return Risk score
     */
    function getRiskScore(address _address) external view returns (uint256) {
        return riskScores[_address];
    }
    
    /**
     * @dev Check transaction for anomalies
     * @param _sender Sender address
     * @param _receiver Receiver address
     * @param _amount Transaction amount
     * @return Risk score for the transaction
     */
    function checkTransaction(
        address _sender,
        address _receiver,
        uint256 _amount
    ) external returns (uint256) {
        // Simple risk calculation based on sender and receiver risk scores
        uint256 senderRisk = riskScores[_sender];
        uint256 receiverRisk = riskScores[_receiver];
        
        // Calculate combined risk score (simple average for now)
        uint256 combinedRisk = (senderRisk + receiverRisk) / 2;
        
        // Adjust risk based on amount (higher amounts = higher risk)
        // This is a simplified model and can be enhanced
        if (_amount > 100 ether) {
            combinedRisk = combinedRisk + 10 > 100 ? 100 : combinedRisk + 10;
        } else if (_amount > 10 ether) {
            combinedRisk = combinedRisk + 5 > 100 ? 100 : combinedRisk + 5;
        }
        
        // Emit event if risk is high
        if (combinedRisk > 70) {
            emit AnomalyDetected(
                _sender,
                _receiver,
                _amount,
                combinedRisk,
                block.timestamp
            );
        }
        
        return combinedRisk;
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
