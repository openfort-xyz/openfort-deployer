// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import "lib/forge-std/src/StdJson.sol";
import { WebAuthnVerifier } from "src/WebAuthn-Verifier/WebAuthnVerifier.sol";
import { Script, console2 as console } from "lib/forge-std/src/Script.sol";

contract DeployWebAuthnVerifier is Script {
    bytes32 constant salt = 0x000000000000000000000000000000000000000000000000000000006b3cb2e2;
    address private CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {
        string memory path = "src/WebAuthn-Verifier/bytecode.json";
        string memory json = vm.readFile(path);
        bytes memory bytecode = stdJson.readBytes(json, ".webAuthnVerifier");

        vm.startBroadcast();

        bytes memory creationCode = abi.encodePacked(type(WebAuthnVerifier).creationCode);
        console.logBytes(creationCode);

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

// forge script script/foundry/DeployGasPolicy.s.sol \
//   --account BURNER_KEY \
//   --rpc-url https://base-rpc.publicnode.com \
//   -vvvv \
//   --verify \
//   --etherscan-api-key QNAZY35DJPVNWFA9G1Y1ITGQ4H4YK8WB1J \
//   --verifier etherscan \
//   --broadcast
