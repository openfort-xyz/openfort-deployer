// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { MinimalAccount } from "src/Account.sol";
import { Script } from "lib/forge-std/src/Script.sol";
import { Create3 } from "lib/create3/contracts/Create3.sol";
import { console2 as console } from "lib/forge-std/src/Script.sol";

contract OGDeployerFactoryV6 {
    constructor(        
        bytes32 _salt,
        bytes memory _creationCode,
        uint256 _value,
        address factoryV6
        ) {
            address ogFactory = Create3.create3(_salt, _creationCode, _value);

            console.log("=================================================");
            console.log("Factory Address:", ogFactory);
            console.log("=================================================");
            
            if (ogFactory != factoryV6) revert("Deployed Incorrect Address");
            selfdestruct(payable(msg.sender));
        }
}

abstract contract Data is Script {
    bytes constant BYTECODE_PAYMASTER   = hex"deedbeef";
    bytes constant BYTECODE_FACTORY_V6  = type(MinimalAccount).creationCode;

    address constant FACTORY_V6         = 0xFb563e9169f096113EA97DFAE13f127A44Ff03eB;
    bytes32 public SALT_FACTORY_V6      = vm.envBytes32("FACTORY_V6_SALT");

    // address constant FACTORY_V5 = 0x5a2ed3e47798123ae30477424731de2ae47cc158;
    // bytes32 constant SALT_FACTORY_V5    = 0xdeedbeef;

    address constant PAYMASTER          = 0x5A2ED3E47798123AE30477424731DE2ae47CC158;
    bytes32 constant SALT_PAYMASTER     = hex"deedbeef";

    address owner;
    address entrypoint;
    address implementation;
    uint256 recoveryPeriod;
    uint256 securityPeriod; 
    uint256 securityWindow; 
    uint256 lockPeriod; 
    address initialGuardian;
}


contract FactoryV6Deployer is Data {
    constructor(
        address _owner, 
        address _entrypoint, 
        address _accountImplementation, 
        uint256 _recoveryPeriod, 
        uint256 _securityPeriod, 
        uint256 _securityWindow, 
        uint256 _lockPeriod, 
        address _initialGuardian
        ) {
            owner = _owner;
            entrypoint = _entrypoint;
            implementation = _accountImplementation;
            recoveryPeriod = _recoveryPeriod;
            securityPeriod = _securityPeriod;
            securityWindow = _securityWindow;
            lockPeriod = _lockPeriod;
            initialGuardian = _initialGuardian;
        }

    function run() public {
        vm.startBroadcast();
        bytes memory creationCode = abi.encodePacked(
            BYTECODE_FACTORY_V6,
            abi.encode(owner, entrypoint, implementation, recoveryPeriod, securityPeriod, securityWindow, lockPeriod, initialGuardian)
        );
        new OGDeployerFactoryV6(SALT_FACTORY_V6, creationCode, 0, FACTORY_V6);
        vm.stopBroadcast();
    }
}