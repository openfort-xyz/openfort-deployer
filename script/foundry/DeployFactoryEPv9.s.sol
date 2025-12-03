// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import "lib/forge-std/src/StdJson.sol";
import { UpgradeableOpenfortFactory } from "src/Factory-AccountEPv9/upgradeable/UpgradeableOpenfortFactory.sol";
import { Script, console2 as console } from "lib/forge-std/src/Script.sol";

contract DeployFactoryEPv9 is Script {
    bytes32 constant salt = 0x00000000000000000000000000000000000000000000000000000000b8d7c078;
    uint256 private constant RECOVERY_PERIOD = 172800;
    uint256 private constant SECURITY_PERIOD = 129600;
    uint256 private constant SECURITY_WINDOW = 43200;
    uint256 private constant LOCK_PERIOD = 432000;
    address private upgradeableOpenfortAccountImpl = 0x000ACC097696Ea735c7EBb1857836EDA53646BC8;
    address internal deployAddress = 0xd4039e3eF2aE8Cf66053948873C443a6CC1be6f3;
    address internal guardianAddress = 0x0fBeDd9dFE3c706fB1E058FD209c561d60a11C66;
    address constant ENTRY_POINT_V9 = 0x433709009B8330FDa32311DF1C2AFA402eD8D009;
    address private CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() public {
        vm.startBroadcast();

        bytes memory constructorArgs = abi.encode(deployAddress, upgradeableOpenfortAccountImpl, RECOVERY_PERIOD, SECURITY_PERIOD, SECURITY_WINDOW, LOCK_PERIOD, guardianAddress);
        // console.logBytes(constructorArgs);

        bytes memory creationCode = abi.encodePacked(type(UpgradeableOpenfortFactory).creationCode, constructorArgs);
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

// forge script script/foundry/DeployPaymasterV3.s.sol \
//   --account BURNER_KEY \
//   --rpc-url https://base-rpc.publicnode.com \
//   -vvvv \
//   --verify \
//   --etherscan-api-key QNAZY35DJPVNWFA9G1Y1ITGQ4H4YK8WB1J \
//   --verifier etherscan \
//   --broadcast