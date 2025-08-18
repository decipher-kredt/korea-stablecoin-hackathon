// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract StablecoinDeposit {
    IERC20 public stablecoin;
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public depositTimestamp;
    
    uint256 public constant INTEREST_RATE = 30; // 3.0% annual
    uint256 public constant LOCK_PERIOD = 365 days;
    uint256 public totalDeposited;
    
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 principal, uint256 interest);
    
    constructor(address _stablecoin) {
        stablecoin = IERC20(_stablecoin);
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        deposits[msg.sender] += amount;
        depositTimestamp[msg.sender] = block.timestamp;
        totalDeposited += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }
    
    function calculateInterest(address user) public view returns (uint256) {
        uint256 principal = deposits[user];
        if (principal == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTimestamp[user];
        if (timeElapsed >= LOCK_PERIOD) {
            return (principal * INTEREST_RATE) / 1000;
        }
        return (principal * INTEREST_RATE * timeElapsed) / (1000 * LOCK_PERIOD);
    }
    
    function withdraw() external {
        uint256 principal = deposits[msg.sender];
        require(principal > 0, "No deposit found");
        
        uint256 interest = calculateInterest(msg.sender);
        uint256 total = principal + interest;
        
        deposits[msg.sender] = 0;
        totalDeposited -= principal;
        
        require(stablecoin.transfer(msg.sender, total), "Transfer failed");
        
        emit Withdrawn(msg.sender, principal, interest);
    }
    
    function getDepositInfo(address user) external view returns (
        uint256 principal,
        uint256 interest,
        uint256 timestamp,
        bool canWithdraw
    ) {
        principal = deposits[user];
        interest = calculateInterest(user);
        timestamp = depositTimestamp[user];
        canWithdraw = (block.timestamp >= depositTimestamp[user] + LOCK_PERIOD) || (interest > 0);
    }
}