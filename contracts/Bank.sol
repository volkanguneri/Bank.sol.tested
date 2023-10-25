// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Bank is Ownable {
    event Deposit(address indexed _from, uint _value);
    event Withdraw(address indexed _from, uint _value);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable onlyOwner {
        require(msg.value >= 0.1 ether, "Not enough funds provided");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint _amount) external onlyOwner {
        require(
            _amount <= address(this).balance,
            "you cannot withdraw this much"
        );
        (bool received, ) = msg.sender.call{value: _amount}("");
        require(received, "the withdraw did not work");
        emit Withdraw(msg.sender, _amount);
    }
}
