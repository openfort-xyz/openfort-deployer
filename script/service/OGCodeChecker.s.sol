// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "lib/forge-std/src/Script.sol";
import { console2 as console } from "lib/forge-std/src/console2.sol";

contract OGCodeChecker is Script {
    
    function run(address contractAddress) external view {
        checkCodeAtAddress(contractAddress);
    }
    
    function checkCodeAtAddress(address contractAddress) public view {
        bool existCode;
        
        assembly {
            existCode := gt(extcodesize(contractAddress), 0)
        }
        
        if (existCode) {
            console.log("Contract exists at address:", contractAddress);
        } else {
            console.log("No contract found at address:", contractAddress);
        }
    }
    
    function checkCodeExists(address contractAddress) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(contractAddress)
        }
        return size > 0;
    }
    
    function checkCodeExistsPure(address contractAddress) public view returns (bool) {
        return contractAddress.code.length > 0;
    }
}