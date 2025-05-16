// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExampleContract {
    string private greeting;
    address private owner;

    event GreetingChanged(string newGreeting, address indexed changer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(string memory _initialGreeting) {
        greeting = _initialGreeting;
        owner = msg.sender;
    }

    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _newGreeting) public {
        require(msg.sender == owner, "Only owner can change the greeting");
        greeting = _newGreeting;
        emit GreetingChanged(_newGreeting, msg.sender);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only current owner can transfer ownership");
        require(newOwner != address(0), "New owner cannot be the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // Fallback function to receive Ether (optional)
    receive() external payable {}

    // Function to withdraw Ether from contract (optional, ensure security)
    function withdraw(uint amount) public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(msg.sender).transfer(amount);
    }
}

