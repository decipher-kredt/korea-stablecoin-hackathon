// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {StableCoin} from "./StableCoinERC20/Token.sol";

contract PaymentSystem is Ownable {
    StableCoin public token;

    event Receipt(address indexed user, uint256 amount, uint256 timestamp);

    constructor(address _token, address _owner) Ownable(_owner) {
        token = StableCoin(_token);
    }

    function pay(uint256 amount) external {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient Balance");
        require(token.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
        emit Receipt(msg.sender, amount, block.timestamp);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
    }
}
