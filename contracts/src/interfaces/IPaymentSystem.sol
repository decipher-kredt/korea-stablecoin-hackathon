// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPaymentSystem {
    function pay(uint256 amount, string[] memory products) external;
    function withdraw(address to, uint256 amount) external;
}
