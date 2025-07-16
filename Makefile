.SILENT:

encrypt-key:
	cast wallet import defauktKey --interactive
compute-factory-v6-address:
	forge script script/OGComputeAddress.s.sol:OGComputeAddressFactoryV6