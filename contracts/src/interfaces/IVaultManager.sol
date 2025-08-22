// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Vault} from "../Vault.sol";

interface IVaultManager {
    function vault() external returns (Vault);
    function deposit(address depositor, uint256 amount) external;
    function withdraw(address depositor) external;
    function changeStableCoinOwnership(address newOwner) external;
    function changeVaultOwnership(address newOwner) external;
    function changeVault(address newVault) external;
    function mint(address account, uint256 value) external;
    function burn(address account, uint256 value) external;
    function getDepositInfo(address depositor)
        external
        view
        returns (uint256 principal, uint256 interest, uint256 timestamp, bool canWithdraw);
}
