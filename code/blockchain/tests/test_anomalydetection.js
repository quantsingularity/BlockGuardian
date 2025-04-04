const AnomalyDetection = artifacts.require("AnomalyDetection");

contract("AnomalyDetection", (accounts) => {
  let instance;
  const owner = accounts[0];

  beforeEach(async () => {
    instance = await AnomalyDetection.new(owner);
  });

  it("should detect high-risk transactions", async () => {
    const result = await instance.detectAnomaly(
      web3.utils.sha3("test"),
      85,
      { from: owner }
    );
    assert.equal(result, true, "Failed to detect high risk");
  });

  it("should ignore low-risk transactions", async () => {
    const result = await instance.detectAnomaly(
      web3.utils.sha3("test2"),
      60,
      { from: owner }
    );
    assert.equal(result, false, "False positive detection");
  });
});