import "dotenv/config"
import { Hex, PrivateKeyAccount, createPublicClient, http, concat, encodeFunctionData, Address, parseEther, padHex, zeroAddress } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { createBundlerClient, entryPoint07Address, UserOperation, getUserOperationHash, entryPoint06Address } from "viem/account-abstraction"
import { getAccountNonce } from "permissionless/actions"
import { createInterface } from 'readline';
import { decrypt, type IKeystore } from '@chainsafe/bls-keystore';
import { readFileSync } from 'fs';
import { buildMinimalAccountInitCode } from '../script/deploy-zero/initCode';
import { abi_factory } from '../script/deploy-free-gas/data/abiFactory';
import { toSimpleSmartAccount } from "permissionless/accounts"
import { createSmartAccountClient } from "permissionless"
import { CREATE2_PROXY, IMPLEMENTATION, ENTRYPOINT_V8 } from "../script/deploy-free-gas/data/addresses"
import { envBigInt } from "../script/deploy-zero/utils/envBigInt"
import { computeCreate2Address } from "../script/deploy-zero/create2"
import { concatHex } from "viem"
import { PublicClient } from "viem"
import { abi_paymasterV2 } from "../script/deploy-free-gas/data/abiPaymasterV2"

const apiKey = process.env.PIMLICO_API
if (!apiKey) throw new Error("Missing PIMLICO_API_KEY")

const FACTORY_ADDRESS = "0xcb71e008b9062bb7abd558816f8135ef2cab576f" as Address;
const IMPLEMENTATION_ADDRESS = "0x6e4a235c5f72a1054abFeb24c7eE6b48AcDe90ab" as Address;
const INITIAL_GUARDIAN = "0xbebCD8Cba50c84f999d6A8C807f261FF278161fb" as Address;
const RECOVERY = envBigInt('RECOVERY');
const SECURITY = envBigInt('SECURITY');
const WINDOW = envBigInt('WINDOW');
const LOCK = envBigInt('LOCK');
const SALT = '0xea69432e1e6530adc820b44390f94f4d323b45a86f59bddee59773d7ec27dba0' as Hex;
const paymasterAddr = '0xcec8020cff71e565DA2b9F3506533d163326A7AD' as Hex;

async function createInitData(account: Hex) {
    const initCode = buildMinimalAccountInitCode(
        account,
        ENTRYPOINT_V8,
        IMPLEMENTATION,
        RECOVERY,
        SECURITY,
        WINDOW,
        LOCK,
        INITIAL_GUARDIAN,
      );
    
      return initCode;
}
export async function hiddenPrompt(label: string): Promise<string> {
    console.log(label);
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    (rl as any)._writeToOutput = () => {};
    return new Promise((res) =>
        rl.question('', (ans) => {
        rl.close();
        console.log();
        res(ans.trim());
        }),
    );
}
    
let cachedAccount: PrivateKeyAccount | undefined;

export async function unlockAccount(): Promise<PrivateKeyAccount> {
    if (cachedAccount) return cachedAccount;
    const keystore = JSON.parse(readFileSync('./script/deploy-free-gas/keystore/freegas.json', 'utf8')) as IKeystore;
    const pwd = await hiddenPrompt('Enter password to decrypt keystore:');
    const priv = (`0x${Buffer.from(await decrypt(keystore, pwd)).toString('hex')}`) as `0x${string}`;
    cachedAccount = privateKeyToAccount(priv);
    return cachedAccount;
}

async function main() {
    const owner = await unlockAccount();
    
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://sepolia.rpc.thirdweb.com"),
    });

    const simpleSmartAccount = await toSimpleSmartAccount({
        owner,
        client: publicClient,
        entryPoint: {
              address: entryPoint06Address,
              version: "0.6"
          }
      })

      const pimlicoBundlerUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_API}`
      const pimlicoClient = createPimlicoClient({ 
        transport: http(pimlicoBundlerUrl),
        entryPoint: {
          address: entryPoint06Address,
          version: "0.6",
        }
      });

      const userOperationGasPrice = await pimlicoClient.getUserOperationGasPrice()

      console.log(userOperationGasPrice);

      const smartAccountClient = createSmartAccountClient({
        account: simpleSmartAccount,
        chain: sepolia,
        bundlerTransport: http(pimlicoBundlerUrl),
        paymaster: pimlicoClient, // optional
        userOperation: {
            estimateFeesPerGas: async () => {
                return (await pimlicoClient.getUserOperationGasPrice()).fast 
            },
        }
    })

    const smartAccountAddress = await smartAccountClient.account.address
    console.log(smartAccountAddress)
    console.log(owner.address)

    const initCode = await createInitData(owner.address)
    const predicted = computeCreate2Address(initCode, SALT);
    console.log(predicted)
    const hash = await smartAccountClient.sendTransaction({
        account: simpleSmartAccount,
        calls: [{
          to: CREATE2_PROXY,
          value: parseEther('0'),
          data: concatHex([SALT, initCode])
        }]
      });
    
      console.log(hash)
}

main().catch(console.error);
