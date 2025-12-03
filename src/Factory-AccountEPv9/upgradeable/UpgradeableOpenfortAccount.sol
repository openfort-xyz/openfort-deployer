// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import {UUPSUpgradeable} from "lib/openzeppelin-contracts-upgradeable-v4-9-0/contracts/proxy/utils/UUPSUpgradeable.sol";
import {Address} from "lib/openzeppelin-contracts-v4.9.0/contracts/utils/Address.sol";
import {BaseRecoverableAccount, IEntryPoint} from "../base/BaseRecoverableAccount.sol";

/**
 * @title UpgradeableOpenfortAccount
 * @notice Minimal smart contract wallet with session keys following the ERC-4337 standard.
 * It inherits from:
 *  - BaseRecoverableAccount
 *  - UUPSUpgradeable
 */
contract UpgradeableOpenfortAccount is BaseRecoverableAccount, UUPSUpgradeable {
    /**
     * Update the EntryPoint address
     */
    function updateEntryPoint(address _newEntrypoint) external {
        _requireFromEntryPointOrOwnerOrSC();
        if (!Address.isContract(_newEntrypoint)) revert NotAContract();
        emit EntryPointUpdated(entrypointContract, _newEntrypoint);
        entrypointContract = _newEntrypoint;
    }

    /**
     * Return the current EntryPoint
     */
    function entryPoint() public view override returns (IEntryPoint) {
        return IEntryPoint(entrypointContract);
    }

    function _authorizeUpgrade(address) internal view override {
        _requireFromEntryPointOrOwnerOrSC();
    }
}
