// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IECommerce {
    struct SellerInfo {
        address addr;
        uint256 balance;
    }

    function sellers(string memory name) external;
    function pay(uint256 amount, string memory name) external;
    function addSeller(string memory name, address addr) external;
    function settle() external;
    function withdraw(address to, uint256 amount) external;
}
