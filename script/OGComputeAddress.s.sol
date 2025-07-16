// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Data } from "script/OGDeployer.s.sol"; 
import { MinimalAccount } from "src/Account.sol";
import { Script } from "lib/forge-std/src/Script.sol";
import { console2 as console } from "lib/forge-std/src/Script.sol";
import { Create2 } from "lib/openzeppelin-contracts/contracts/utils/Create2.sol";

contract OGComputeAddressFactoryV6 is Script, Data {
    
    constructor() {
        // Demo constructor parameters
        owner = 0x1234567890123456789012345678901234567890;
        entrypoint = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; 
        implementation = 0xabCDeF0123456789AbcdEf0123456789aBCDEF01;
        recoveryPeriod = 7 days;
        securityPeriod = 2 days;
        securityWindow = 1 hours;
        lockPeriod = 30 days;
        initialGuardian = 0x9876543210987654321098765432109876543210;
    }

    function run() public view {

        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        
        bytes memory constructorParams = abi.encode(
            owner, 
            entrypoint, 
            implementation, 
            recoveryPeriod, 
            securityPeriod, 
            securityWindow, 
            lockPeriod, 
            initialGuardian
        );
        
        bytes memory creationCode = abi.encodePacked(BYTECODE_FACTORY_V6, constructorParams);
        
        address computedAddress = Create2.computeAddress(
            SALT_FACTORY_V6,           
            keccak256(creationCode),   
            deployer                   
        );
        
        console.log("=================================================");
        console.log("Computing CREATE2 address:");
        console.log("=================================================");
        console.log("Deployer:", deployer);
        console.log("Salt:", vm.toString(SALT_FACTORY_V6));
        console.log("Bytecode length:", creationCode.length);
        
        console.log("Computed CREATE2 Address:", computedAddress);
        console.log("=================================================");
        console.log("Target FACTORY_V6:", FACTORY_V6);
        
        if (computedAddress == FACTORY_V6) {
            console.log("SUCCESS: Computed address matches target!");
        } else {
            console.log("MISMATCH: Need to adjust salt or deployer");
        }
    }
}