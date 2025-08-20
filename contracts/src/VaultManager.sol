// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {StableCoin} from "./StableCoinERC20/Token.sol";
import {Vault} from "./Vault.sol";

contract VaultManager is Ownable {
    StableCoin public token;
    Vault public vault;

    event MintAndDeposit(address indexed user, uint256 amount, uint256 timestamp);

    constructor(address _token, address _owner) Ownable(_owner) {
        token = StableCoin(_token);
        vault = new Vault(_token, address(this));
    }

    // Mint And Deposit for user
    function deposit(address depositor, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(depositor != address(0), "ZERO ADDRESS");

        token.mint(address(this), amount);
        token.approve(address(vault), amount);
        vault.deposit(depositor, amount);

        emit MintAndDeposit(depositor, amount, block.timestamp);
    }

    function withdraw(address depositor) external {
        vault.withdraw(depositor);
    }

    function changeStableCoinOwnership(address newOwner) external onlyOwner {
        token.transferOwnership(newOwner);
    }

    function changeVaultOwnership(address newOwner) external onlyOwner {
        vault.changeVaultManager(newOwner);
    }

    function changeVault(address newVault) external onlyOwner {
        require(newVault != address(0), "ZERO ADDRESS");
        vault = Vault(newVault);
    }

    function getDepositInfo(address depositor)
        external
        view
        returns (uint256 principal, uint256 interest, uint256 timestamp, bool canWithdraw)
    {
        return vault.getDepositInfo(depositor);
    }

    function mint(address account, uint256 value) external onlyOwner {
        token.mint(account, value);
    }

    function burn(address account, uint256 value) external onlyOwner {
        token.burn(account, value);
    }
}
