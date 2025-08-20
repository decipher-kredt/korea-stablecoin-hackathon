// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Vault {
    address private vaultManager;

    IERC20 public stablecoin;

    mapping(address => uint256) public depositors;
    mapping(address => uint256) public depositTimestamp;

    uint256 public constant INTEREST_RATE = 30; // 3.0% annual
    uint256 public constant LOCK_PERIOD = 365 days;
    uint256 public totalDeposited;

    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 principal, uint256 interest);

    constructor(address _stablecoin, address _vaultManager) {
        vaultManager = _vaultManager;
        stablecoin = stablecoin = IERC20(_stablecoin);
    }

    modifier onlyVaultManager() {
        require(msg.sender == vaultManager, "Only VaultManager");
        _;
    }

    function changeVaultManager(address newVaultManager) external onlyVaultManager {
        require(newVaultManager != address(0), "ZERO ADDRESS");
        vaultManager = newVaultManager;
    }

    function deposit(address depositor, uint256 amount) external onlyVaultManager {
        require(amount > 0, "Amount must be greater than 0");
        require(depositor != address(0), "ZERO ADDRESS");
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        depositors[depositor] += amount;
        depositTimestamp[depositor] = block.timestamp;
        totalDeposited += amount;

        emit Deposited(depositor, amount, block.timestamp);
    }

    function calculateInterest(address depositor) public view returns (uint256) {
        uint256 principal = depositors[depositor];
        if (principal == 0) return 0;

        uint256 timeElapsed = block.timestamp - depositTimestamp[depositor];
        if (timeElapsed >= LOCK_PERIOD) {
            return (principal * INTEREST_RATE) / 1000;
        }
        return (principal * INTEREST_RATE * timeElapsed) / (1000 * LOCK_PERIOD);
    }

    function withdraw(address depositor) external onlyVaultManager {
        uint256 principal = depositors[depositor];
        require(principal > 0, "No deposit found");

        uint256 interest = calculateInterest(depositor);
        uint256 total = principal + interest;

        depositors[depositor] = 0;
        totalDeposited -= principal;

        require(stablecoin.transfer(depositor, total), "Transfer failed");

        emit Withdrawn(depositor, principal, interest);
    }

    function getDepositInfo(address depositor)
        external
        view
        returns (uint256 principal, uint256 interest, uint256 timestamp, bool canWithdraw)
    {
        principal = depositors[depositor];
        interest = calculateInterest(depositor);
        timestamp = depositTimestamp[depositor];
        canWithdraw = (block.timestamp >= depositTimestamp[depositor] + LOCK_PERIOD) || (interest > 0);
    }
}
