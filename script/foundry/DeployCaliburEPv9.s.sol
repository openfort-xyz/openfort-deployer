// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { CaliburEntry } from "src/CaliburEPv9/CaliburEntry.sol";
import { Script, console2 as console } from "lib/forge-std/src/Script.sol";

contract DeployCaliburEPv9 is Script {
    bytes32 constant salt = 0x0000000000000000000000000000000000000000000000000000000020522532;
    address private CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {

        vm.startBroadcast();

        bytes memory creationCode = abi.encodePacked(type(CaliburEntry).creationCode);
        // console.logBytes(creationCode);

        address expectedAddress = vm.computeCreate2Address(salt, keccak256(creationCode), CREATE2_DEPLOYER);

        console.log("Expected deployment address:", expectedAddress);
        console.log("Using salt:", vm.toString(salt));
        console.log("CREATE2 Deployer:", CREATE2_DEPLOYER);

        if (expectedAddress.code.length > 0) {
            console.log("Contract already deployed at:", expectedAddress);
            vm.stopBroadcast();
            return;
        }

        bytes memory deploymentData = abi.encodePacked(salt, creationCode);

        (bool success, bytes memory res) = CREATE2_DEPLOYER.call(deploymentData);
        require(address(bytes20(res)) == expectedAddress, "Wrong Addres Delpoyed");

        require(success, "CREATE2 deployment failed");

        console.log("Contract deployed successfully!");
        console.log("Deployed to expected address:", expectedAddress);

        require(expectedAddress.code.length > 0, "No code at deployed address");

        console.log("Deployment completed successfully!");

        vm.stopBroadcast();
    }
}

// forge script src/CaliburEntry.sol:CaliburEntry \
//   --account BURNER_KEY \
//   --rpc-url https://polygon-amoy-bor-rpc.publicnode.com \
//   -vvvv \
//   --verify \
//   --etherscan-api-key QNAZY35DJPVNWFA9G1Y1ITGQ4H4YK8WB1J \
//   --verifier etherscan \
//   --broadcast
