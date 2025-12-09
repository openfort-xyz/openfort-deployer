// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import "lib/forge-std/src/StdJson.sol";
import { OPFPaymasterV3 } from "src/PaymasterV3EPv9Async/OPFPaymasterV3.sol";
import { Script, console2 as console } from "lib/forge-std/src/Script.sol";

contract DeployPaymasterV3EPv9AsyncTest is Script {
    bytes32 constant salt = 0x000000000000000000000000000000000000000000000000000000031b7dd1f4;
    address owner = 0xA84E4F9D72cb37A8276090D3FC50895BD8E5Aaf1;
    address manager = 0xd0c4637b0Fac10cba161907D9b6A1135241DeC91;
    address private CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {
        string memory path = "src/PaymasterV3EPv8/bytecode.json";
        string memory json = vm.readFile(path);
        bytes memory bytecode = stdJson.readBytes(json, ".paymasterV3");

        vm.startBroadcast();
        address[] memory signers = new address[](1);
        signers[0] = 0x50Eb929D025E9b9d2c29CA1849D9673275DB91f5;

        bytes memory constructorArgs = abi.encode(owner, manager, signers);
        // console.logBytes(constructorArgs);

        bytes memory creationCode = abi.encodePacked(type(OPFPaymasterV3).creationCode, constructorArgs);
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

        OPFPaymasterV3 pm = OPFPaymasterV3(payable(expectedAddress));

        require(owner == pm.OWNER(), "WrongOwner");
        require(manager == pm.MANAGER(), "WrongManager");
        require(pm.signers(signers[0]) == true, "WrongSigner");

        vm.stopBroadcast();
    }
}

// forge script script/foundry/DeployPaymasterV3EPv9AsyncTest \
//   --account BURNER_KEY \
//   --rpc-url https://optimism-sepolia-public.nodies.app \
//   -vvvv \
//   --verify \
//   --etherscan-api-key QNAZY35DJPVNWFA9G1Y1ITGQ4H4YK8WB1J \
//   --verifier etherscan \
//   --broadcast
