// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MinimalAccountV3 {
    address internal owner;
    address internal entrypoint;
    address public accountImplementation;
    uint256 public recoveryPeriod;
    uint256 public securityPeriod;
    uint256 public securityWindow;
    uint256 public lockPeriod;
    address public initialGuardian;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

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
        accountImplementation = _accountImplementation;
        recoveryPeriod = _recoveryPeriod;
        securityPeriod = _securityPeriod;
        securityWindow = _securityWindow;
        lockPeriod = _lockPeriod;
        initialGuardian = _initialGuardian;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }

    function execute(address target, uint256 value, bytes calldata data) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Call failed");
        return result;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function getEP() external view returns (address) {
        return entrypoint;
    }

    receive() external payable {}
}
