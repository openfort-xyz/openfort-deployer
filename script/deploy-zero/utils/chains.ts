import 'dotenv/config';

const rpcData = require('../data/RPC.json');

interface RpcUrls {
  mainet: string;
  base: string;
  arbitrum: string;
  bnb: string;
  avalanche: string;
  polygon: string;
  sonic: string;
  optimism: string;
  zora: string;
  arbitrum_nova: string;
  polygon_zkEVM: string;
  gnosis: string;
  scroll: string;
  linea: string;
  beam: string;
  taiko_alethia: string;
  clankermon: string;
  kl1: string;
  // Testnets
  sepolia: string;
  base_sepolia: string;
  arbitrum_sepolia: string;
  optimism_sepolia: string;
  taiko_hekla: string;
  polygon_amoy: string;
  beam_testnet: string;
  avalanche_fuji_testnet: string;
  bsc_testnet: string;
  monad_testnet: string;
  titan_testnet: string;
  opBNB_testnet: string;
  zora_testnet: string;
  dos_chain_testnet: string;
  immutable_zkEVM_testnet: string;
  soneium_minato: string;
}

const {
  mainet,
  base,
  arbitrum,
  bnb,
  avalanche,
  polygon,
  sonic,
  optimism,
  zora,
  arbitrum_nova,
  polygon_zkEVM,
  gnosis,
  scroll,
  linea,
  beam,
  taiko_alethia,
  clankermon,
  kl1,
  // Testnets
  sepolia,
  base_sepolia,
  arbitrum_sepolia,
  optimism_sepolia,
  taiko_hekla,
  polygon_amoy,
  beam_testnet,
  avalanche_fuji_testnet,
  bsc_testnet,
  monad_testnet,
  titan_testnet,
  opBNB_testnet,
  zora_testnet,
  dos_chain_testnet,
  immutable_zkEVM_testnet,
  soneium_minato,
} = rpcData as RpcUrls;

export interface ChainConfig {
  id: number;
  name: string;
  rpc: string;
  explorerAPI?: string;
  // explorerURL: string;
}

export const mainetChain: ChainConfig = { id: 1, name: 'Ethereum', rpc: mainet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const baseChain: ChainConfig = { id: 8453, name: 'Base', rpc: base, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const arbitrumChain: ChainConfig = { id: 42161, name: 'Arbitrum', rpc: arbitrum, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const bnbChain: ChainConfig = { id: 56, name: 'BNB', rpc: bnb, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const avalancheChain: ChainConfig = { id: 43114, name: 'Avalanche C-Chain', rpc: avalanche, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const polygonChain: ChainConfig = { id: 137, name: 'Polygon', rpc: polygon, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const sonicChain: ChainConfig = { id: 146, name: 'Sonic', rpc: sonic, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const optimismChain: ChainConfig = { id: 10, name: 'Optimism', rpc: optimism, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const zoraChain: ChainConfig = { id: 7777777, name: 'Zora', rpc: zora, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const arbitrumNovaChain: ChainConfig = { id: 42170, name: 'Arbitrum Nova', rpc: arbitrum_nova, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const polygonZkEVMChain: ChainConfig = { id: 1101, name: 'Polygon zkEVM', rpc: polygon_zkEVM, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const gnosisChain: ChainConfig = { id: 100, name: 'Gnosis', rpc: gnosis, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const scrollChain: ChainConfig = { id: 534352, name: 'Scroll', rpc: scroll, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const lineaChain: ChainConfig = { id: 59144, name: 'Linea', rpc: linea, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const beamChain: ChainConfig = { id: 4337, name: 'Beam', rpc: beam, explorerAPI: process.env.BEAM_API_KEY };
export const taikoAlethiaChain: ChainConfig = { id: 167000, name: 'Taiko Alethia', rpc: taiko_alethia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const clankermonChain: ChainConfig = { id: 510525, name: 'Clankermon', rpc: clankermon, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const kl1Chain: ChainConfig = { id: 3008, name: 'kl1', rpc: kl1, explorerAPI: process.env.ETHERSCAN_API_KEY };
  // Testnets
export const sepoliaChain: ChainConfig = { id: 11155111, name: 'Sepolia', rpc: sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const baseSepoliaChain: ChainConfig = { id: 84532, name: 'Base Sepolia', rpc: base_sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const arbitrumSepoliaChain: ChainConfig = { id: 421614, name: 'Arbitrum Sepolia', rpc: arbitrum_sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const optimismSepoliaChain: ChainConfig = { id: 11155420, name: 'OP Sepolia', rpc: optimism_sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const taikoHeklaChain: ChainConfig = { id: 167009, name: 'Taiko Hekla', rpc: taiko_hekla, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const polygonAmoyChain: ChainConfig = { id: 80002, name: 'Polygon Amoy', rpc: polygon_amoy, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const beamTestnetChain: ChainConfig = { id: 13337, name: 'Beam Testnet', rpc: beam_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const avalancheFujiTestnet: ChainConfig = { id: 43113, name: 'Avalanche Fuji Testnet', rpc: avalanche_fuji_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const bscTestnet: ChainConfig = { id: 97, name: 'BNB Smart Chain Testnet', rpc: bsc_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const monadTestnet: ChainConfig = { id: 143, name: 'Monad Testnet', rpc: monad_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const titanTestnet: ChainConfig = { id: 18889, name: 'Titan Testnet', rpc: titan_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const opBNBTestnet: ChainConfig = { id: 5611, name: 'opBNB Testnet', rpc: opBNB_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const zoraTestnet: ChainConfig = { id: 999999999, name: 'Zora Sepolia Testnet', rpc: zora_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const dosChainTestnet: ChainConfig = { id: 3939, name: 'DOS Testnet', rpc: dos_chain_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const immutablezkEVMTestnet: ChainConfig = { id: 13473, name: 'Immutable zkEVM Testnet', rpc: immutable_zkEVM_testnet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const soneiumMinato: ChainConfig = { id: 1946, name: 'Soneium Testnet Minato', rpc: soneium_minato, explorerAPI: process.env.ETHERSCAN_API_KEY };

export const CHAINS_BY_FLAG: Record<string, ChainConfig> = {
  mainet: mainetChain,
  mainnet: mainetChain,
  ethereum: mainetChain,
  base: baseChain,
  arbitrum: arbitrumChain,
  bnb: bnbChain,
  avalanche: avalancheChain,
  polygon: polygonChain,
  sonic: sonicChain,
  optimism: optimismChain,
  zora: zoraChain,
  arbitrum_nova: arbitrumNovaChain,
  polygon_zkevm: polygonZkEVMChain,
  gnosis: gnosisChain,
  scroll: scrollChain,
  linea: lineaChain,
  beam: beamChain,
  taiko: taikoAlethiaChain,
  taiko_alethia: taikoAlethiaChain,
  clankermon: clankermonChain,
  kl1: kl1Chain,
  // Testnets
  sepolia: sepoliaChain,
  base_sepolia: baseSepoliaChain,
  arbitrum_sepolia: arbitrumSepoliaChain,
  optimism_sepolia: optimismSepoliaChain,
  taiko_hekla: taikoHeklaChain,
  polygon_amoy: polygonAmoyChain,
  beam_testnet: beamTestnetChain,
  avalanche_fuji_testnet: avalancheFujiTestnet,
  bsc_testnet: bscTestnet,
  titan_testnet: titanTestnet,
  opBNB_testnet: opBNBTestnet,
  zora_testnet: zoraTestnet,
  dos_chain_testnet: dosChainTestnet,
  immutable_zkEVM_testnet: immutablezkEVMTestnet,
  soneium_minato: soneiumMinato,
};