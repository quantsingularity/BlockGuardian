const TransactionMonitor = artifacts.require("TransactionMonitor");
const AnomalyDetection = artifacts.require("AnomalyDetection");

module.exports = function(deployer) {
  deployer.deploy(TransactionMonitor);
  deployer.deploy(AnomalyDetection);
};