// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "lib/forge-std/src/Script.sol";
import { console2 as console } from "lib/forge-std/src/Script.sol";

contract ChainId is Script {
    function run() public {
        uint256 chainId;

        assembly {
            chainId := chainid()
        }

        console.log("chainId", chainId);
    }
}

