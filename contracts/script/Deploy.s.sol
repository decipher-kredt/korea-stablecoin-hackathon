// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {StableCoin} from "../src/StableCoinERC20/Token.sol";
import {Vault} from "../src/Vault.sol";
import {VaultManager} from "../src/VaultManager.sol";
import {PaymentSystem} from "../src/PaymentSystem.sol";
import {ECommerce} from "../src/ECommerce.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();

        StableCoin KREDT = new StableCoin("KREDT", "KREDT", msg.sender);
        console.log("KREDT: ", address(KREDT));

        VaultManager vaultManager = new VaultManager(address(KREDT), msg.sender);
        KREDT.approve(address(vaultManager), type(uint256).max);
        KREDT.mint(address(vaultManager.vault()), 100_000_000 ether);
        KREDT.transferOwnership(address(vaultManager));

        console.log("Vault: ", address(vaultManager.vault()));
        console.log("VaultManager: ", address(vaultManager));

        PaymentSystem payment = new PaymentSystem(address(KREDT), msg.sender);
        console.log("PayamentSystem: ", address(payment));

        ECommerce ecommerce = new ECommerce(address(KREDT), msg.sender);
        console.log("ECommerce: ", address(ecommerce));

        ecommerce.addSeller("Nike", address(0x2AC0fa1C8CF6f988999B51Ac66d22ff1E0ce7D2a));
        ecommerce.addSeller("Adidas", address(0x1d24ef3E80a08A6192aaCd3AE29afC07b0C90024));
        ecommerce.addSeller("Puma", address(0x5D0Aaf78624C12785e7fF5CDaFBAE4689271b562));

        vm.stopBroadcast();
    }
}
