// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {StableCoin} from "./StableCoinERC20/Token.sol";

contract ECommerce is Ownable {
    StableCoin public token;
    uint256 public constant FEE_RATE = 50; // 5.0%
    string[] sellerName;

    struct SellerInfo {
        address addr;
        uint256 balance;
    }

    mapping(string name => SellerInfo) public sellers;

    event NewSeller(string name, address addr);
    event SettleMent(string name, address addr, uint256 amount, uint256 timestamp);

    constructor(address _token, address _owner) Ownable(_owner) {
        token = StableCoin(_token);
    }

    // Mint And Deposit for user
    function pay(uint256 amount, string memory name) external {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient Balance");
        require(token.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
        sellers[name].balance += amount;
    }

    function addSeller(string memory name, address addr) public onlyOwner {
        sellerName.push(name);
        sellers[name] = SellerInfo(addr, 0);

        emit NewSeller(name, addr);
    }

    function settle() external onlyOwner {
        SellerInfo memory info;
        uint256 amount;

        for (uint256 i = 0; i < sellerName.length; i++) {
            info = sellers[sellerName[i]];
            if (info.balance == 0) {
                continue;
            }
            // calculate fee
            amount = info.balance - ((info.balance * FEE_RATE) / 1000);
            require(token.transfer(info.addr, amount), "Failed settle()");
            sellers[sellerName[i]].balance = 0;

            emit SettleMent(sellerName[i], info.addr, amount, block.timestamp);
        }
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
    }
}
