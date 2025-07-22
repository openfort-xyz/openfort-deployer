```bash
         xxx          -*~*-             ===           +++        `  ___  '        _/7
        (o o)         (o o)            (o o)         (o o)      -  (O o)  -      (o o)
    ooO--(_)--Ooo-ooO--(_)--Ooo----ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-

                                                    
                                                        
                        ▗▄▄▖ ▄   ▄      ▄▀▀▚▖▄   ▄ ▗▖ ▗▖ ▄▄▄  ▄ ▄▄▄▄  ▗▞▀▚▖ ▄▄▄ 
                        ▐▌ ▐▌█   █      █  ▐▌ ▀▄▀  ▐▌▗▞▘█   █ ▄ █   █ ▐▛▀▀▘█    
                        ▐▛▀▚▖ ▀▀▀█      █  ▐▌▄▀ ▀▄ ▐▛▚▖ ▀▄▄▄▀ █ █   █ ▝▚▄▄▖█    
                        ▐▙▄▞▘ ▄  █      ▀▄▄▞▘      ▐▌ ▐▌      █                 
                              ▀▀▀                                            


         xxx          -*~*-             ===           +++        `  ___  '        _/7
        (o o)         (o o)            (o o)         (o o)      -  (O o)  -      (o o)
    ooO--(_)--Ooo-ooO--(_)--Ooo----ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-
```

<h1 align="center"> Openfort OG-Deployer </h1>

<p align="center">
  <img src="./src/Logo_black_primary_no_bg.png" alt="Openfort" style="width: 300px;" />
</p>

> 🚧 **Internal Service of Openfort Team**
> 
> This repository is not for prod.  
> Scrips are **unaudited**, and the codebase may have **breaking changes** without notice.

**OG-Deployer by 0xKoiner**

---

## Overview

***OG-Deployer*** is an internal utility that lets the Openfort team ship contracts quickly—whether to one network or many—without sacrificing security or verifiability.

Openfort is committed to open-source ideals, the tool is published for anyone who wants streamlined, multi-chain deployments.

## Features

- [x] **Chain-Zero**: One-click deployment to one or many EVM chains.
---
- [x] **Chain-Support**: Gas-sponsored deployments, batch deployment and bundling for any supported chain.
---
- [x] **Verifier**: Automatic contract verification on explorers across multiple chains (also gas-sponsored).
---
- [x] **KeyStore**: BLS-keystore generation so private keys stay encrypted at rest.
---
- [x] **OG-CLI**: A single, ergonomic CLI that drives every workflow above.
---

## Script Architecture

### Core
```bash
script
├── deploy-free-gas
├── deploy-zero
└── keystore
```

- **`deploy-free-gas`**  
  End-to-end Account-Abstraction flow. Uses the Openfort Paymaster to sponsor gas and the Pimlico bundler to submit the UserOp—deploy one or many contracts on any supported EVM chain without holding native tokens.

- **`deploy-zero`**  
  Minimal Deterministic deployer that pushes contracts with a plain EOA (no paymaster, no bundler). Ideal for quick, gas-paid deployments.

- **`keystore`**  
  Helper scripts to generate, encrypt, and manage BLS keystores—keeping private keys safe while remaining usable by the other two flows.

---

## Getting Started
1. Clone Repos:
```bash
# Deploy-tool source
git clone https://github.com/openfort-xyz/openfort-deployer.git

# Offline keystore generator (optional but recommended)
git clone https://github.com/0xkoiner/keystore.git
```

2. Generate encrypted keystores (freegas.json & paymaster.json):

>***Tip You can run the generator offline on an air-gapped machine;*** 
>***Only copy the resulting .json files into openfort-deployer/script/keystore.Your raw private keys never leave the secure environment.***

```bash
cd keystore

# Install
npm i
yarn

# Run Cli-Tool
⚠️ Launch interactive CLI once for each private key.  
⚠️ Rename (freegas: EOA owner of future Smart Wallet Account, paymaster: EOA owner of Paymaster)

sh keystore-cli.sh
# └─ prompts for the hex private key and an encryption password
> Enter your private key (hex):

> Enter password:

# Rename the Keystore.json 
mv keystore-manager/keystore.json keystore-manager/freegas.json      # EOA that will own the smart-wallet
mv keystore-manager/keystore.json keystore-manager/paymaster.json    # EOA that will own the paymaster

🔑 Copy both files into the deployer to >>openfort-deployer/script/keystore
```

3. Create .env:
```bash
cd openfort-deployer

# — addresses ———————————————————————————————————————————————————————
DEPLOYER_ADDRESS=<PAYMASTER Address> # same address that appears in paymaster.json
FACTORY_V6_SALT=<Bytes32> # bytes32 salt for deterministic CREATE2
DEPLOYER_MANAGER_SALT=<Salt to Deploy Account with Openfort Factory> # salt for Openfort factory (leave empty if unused)

RECOVERY=<Uint256>
SECURITY=<Uint256>
WINDOW=<Uint256>
LOCK=<Uint256>

ETHERSCAN_API_KEY=<API KEY> 

PIMLICO_API=<API KEY>
```
4. Install Dependencies:
```bash
# Install
npm i
yarn

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```
---

## Global Setup

1. Contracts adding:
>***Before running script must have validate/set that right contracts will deployed on the new EVM Network.***
```ts
≫ script/deploy-zero/utils/ContractsByteCode.ts
≫ script/deploy-free-gas/utils/ContractsByteCode.ts

    static Contract_Name: ContractToDeploy = 
    {   name: 'Contract_Name', // The name of the contract in .sol
        path : '', // Path to the contract.
        isExist: false, // Set <true> If Contract Deployed in Case using with creation bytecode from Determenistic Deployer transacrion.
        salt: 'Salt from .env',
        creationByteCode: '' as Hex // Creation bytecode from Determenistic Deployer transacrion or if not deployed use with helper sh getByteCode.sh --path <path>
    } as ContractToDeploy;

    /*
    static MinimalAccount: ContractToDeploy = 
    {   name: 'MinimalAccount',
        path : 'src/Account.sol',
        isExist: false,
        salt: FACTORY_V6_SALT,
        creationByteCode: '0x6080604052346100.......' as Hex
    } as ContractToDeploy;
    */
```
>To get creationByteCode of smart contract use with cli-tool
```bash
sh getByteCode.sh --path <contract_path:contract_name>

# sh getByteCode.sh --path src/AccountV6:MinimalAccountV6
```
>***Only in script/deploy-free-gas/utils/ContractsByteCode.ts***
```ts
// Set contracts you want to deploy fro batch deployer
    static getAllContracts(): ContractToDeploy[] {
        return [
            ContractsToDeploy.Contract_Name,
            ContractsToDeploy.Contract_Name,
        ];
    }
```

2. Chains Setup:
```ts
// Check in ./data/RPC.json available newtworks Rpc
{
    "mainet": "https://ethereum-rpc.publicnode.com",
    "base": "https://base-rpc.publicnode.com",
    ...
    ...
    ...
    // add new if needed
}

// In ./utils/chains.ts all supported chains
import 'dotenv/config';

const rpcData = require('../data/RPC.json');

interface RpcUrls {
  mainet: string;
  ...
  ...
  ...
}

const {
  mainet,
  ...
  ...
  ...
} = rpcData as RpcUrls;

export interface ChainConfig {
  id: number;
  name: string;
  rpc: string;
  explorerAPI?: string;
  // explorerURL: string;
}

export const mainetChain: ChainConfig = { id: 1, name: 'Ethereum', rpc: mainet, explorerAPI: process.env.ETHERSCAN_API_KEY };
...
...
...

export const CHAINS_BY_FLAG: Record<string, ChainConfig> = {
  mainet: mainetChain,
  ...
  ...
  ...
};
```
3. Explorers Setup:
```ts
// ./data/explorerUrl.ts
import chalk from 'chalk'

export const explorer_url = {
    "Ethereum": "https://etherscan.io/",
    ...
    ...
    ...
}

export function getExplorerUrl(chainName: string, txHash: string): string {
    const baseUrl = explorer_url[chainName as keyof typeof explorer_url];

    if (!baseUrl) {
        console.warn(chalk.yellow(`Unknown chain: ${chainName}, using default explorer`));
        return `https://etherscan.io/tx/${txHash}`;
    }
    
    return `${baseUrl}tx/${txHash}`;
} 
```

4. Addresses Setup:
```ts
// ./data/addresses.ts
import { Hex } from "viem";

export const CREATE2_PROXY: Hex         = '0x4e59b44847b379578588920cA78FbF26c0B4956C' as Hex;

export const ENTRYPOINT_V8: Hex         = '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108' as Hex;
export const ENTRYPOINT_V7: Hex         = '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as Hex;
export const ENTRYPOINT_V6: Hex         = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Hex;

export const IMPLEMENTATION: Hex        = '0x6e4a235c5f72a1054abFeb24c7eE6b48AcDe90ab' as Hex;

export const INITIAL_GUARDIAN: Hex      = '0xbebCD8Cba50c84f999d6A8C807f261FF278161fb' as Hex;
```

## Run:
CLI-Tool.
```bash
sh OGDeployer.sh 
```

Custom command for deployment.
```bash
# Deploy-Zero
npx ts-node script/deploy-zero/index.ts <Contract_Name> \
  --sepolia \
  --base_sepolia \
  --optimism_sepolia \
  --arbitrum_sepolia

# Deploy Free Gas
npx ts-node script/deploy-free-gas/index.ts \
  --sepolia \
  --base_sepolia \
  --optimism_sepolia \
  --arbitrum_sepolia
```
Custom command for verify.
```bash
npx ts-node script/deploy-zero/verify-multi.ts \
  --address <Deployed Contract Address> \
  --path <Deployed Contract Path> \
  --sepolia \
  --base_sepolia \
  --optimism_sepolia \
  --arbitrum_sepolia \
  --constructor $(cast abi-encode "constructor(address,address,address,uint256,uint256,uint256,uint256,address)" 0x32080A4dcf6F164E3d0f0C33187c44443B67C919 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 0x6e4a235c5f72a1054abFeb24c7eE6b48AcDe90ab 172800 86400 43200 8640 0xbebCD8Cba50c84f999d6A8C807f261FF278161fb) # Example
```