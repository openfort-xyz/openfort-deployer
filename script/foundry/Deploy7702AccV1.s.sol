// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import "lib/forge-std/src/StdJson.sol";
import { OPFMain } from "src/7702AccV1/core/OPFMain.sol";
import { Script, console2 as console } from "lib/forge-std/src/Script.sol";

contract Deploy7702AccV1 is Script {
    bytes32 constant salt = 0x00000000000000000000000000000000000000000000000000000002a9e66e8b;
    address constant WEBAUTHN_VERIFIER = 0x00000256d7ef704c043cb352D7D6D3546A720A2e;
    address constant ENTRY_POINT_V8 = 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108;
    address constant GAS_POLICY = 0x4337fEeEC9Af990cda9E99B4c1c480A2a9700301;
    uint256 constant RECOVERY_PERIOD = 2 days;
    uint256 constant LOCK_PERIOD = 5 days;
    uint256 constant SECURITY_PERIOD = 1.5 days;
    uint256 constant SECURITY_WINDOW = 0.5 days;
    address private CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {
        string memory path = "src/7702AccV1/bytecode.json";
        string memory json = vm.readFile(path);
        bytes memory bytecode = stdJson.readBytes(json, ".OPFMain");

        vm.startBroadcast();

        bytes memory constructorArgs = abi.encode(
            ENTRY_POINT_V8,
            WEBAUTHN_VERIFIER,
            RECOVERY_PERIOD,
            LOCK_PERIOD,
            SECURITY_PERIOD,
            SECURITY_WINDOW,
            GAS_POLICY
        );
        // console.logBytes(constructorArgs);

        bytes memory creationCode = abi.encodePacked(type(OPFMain).creationCode, constructorArgs);
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

        OPFMain pm = OPFMain(payable(expectedAddress));

        // require(owner == pm.OWNER(), "WrongOwner");
        // require(manager == pm.MANAGER(), "WrongManager");
        // require(pm.signers(signers[0]) == true, "WrongSigner");

        vm.stopBroadcast();
    }
}

// forge script script/foundry/DeployPaymasterV3.s.sol \
//   --account BURNER_KEY \
//   --rpc-url https://base-rpc.publicnode.com \
//   -vvvv \
//   --verify \
//   --etherscan-api-key QNAZY35DJPVNWFA9G1Y1ITGQ4H4YK8WB1J \
//   --verifier etherscan \
//   --broadcast
