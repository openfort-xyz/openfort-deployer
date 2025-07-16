import 'dotenv/config';

const rpcData = require('./RPC.json');

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
  sepolia: string;
  base_sepolia: string;
  arbitrum_sepolia: string;
  optimism_sepolia: string;
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
  sepolia,
  base_sepolia,
  arbitrum_sepolia,
  optimism_sepolia,
} = rpcData as RpcUrls;

export interface ChainConfig {
  id: number;
  name: string;
  rpc: string;
  explorerAPI?: string;
}

export const mainetChain: ChainConfig = { id: 1, name: 'Ethereum', rpc: mainet, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const baseChain: ChainConfig = { id: 8453, name: 'Base', rpc: base, explorerAPI: process.env.BASESCAN_API_KEY };
export const arbitrumChain: ChainConfig = { id: 42161, name: 'Arbitrum', rpc: arbitrum, explorerAPI: process.env.ARBISCAN_API_KEY };
export const bnbChain: ChainConfig = { id: 56, name: 'BNB', rpc: bnb, explorerAPI: process.env.BSCSCAN_API_KEY };
export const avalancheChain: ChainConfig = { id: 43114, name: 'Avalanche C-Chain', rpc: avalanche, explorerAPI: process.env.SNOWTRACE_API_KEY };
export const polygonChain: ChainConfig = { id: 137, name: 'Polygon', rpc: polygon, explorerAPI: process.env.POLYGONSCAN_API_KEY };
export const sonicChain: ChainConfig = { id: 146, name: 'Sonic', rpc: sonic, explorerAPI: process.env.SONIC_API_KEY };
export const optimismChain: ChainConfig = { id: 10, name: 'Optimism', rpc: optimism, explorerAPI: process.env.OPTIMISTIC_ETHERSCAN_API_KEY };
export const zoraChain: ChainConfig = { id: 7777777, name: 'Zora', rpc: zora, explorerAPI: process.env.ZORA_API_KEY };
export const arbitrumNovaChain: ChainConfig = { id: 42170, name: 'Arbitrum Nova', rpc: arbitrum_nova, explorerAPI: process.env.ARBISCAN_NOVA_API_KEY };
export const polygonZkEVMChain: ChainConfig = { id: 1101, name: 'Polygon zkEVM', rpc: polygon_zkEVM, explorerAPI: process.env.POLYGON_ZKEVM_API_KEY };
export const gnosisChain: ChainConfig = { id: 100, name: 'Gnosis', rpc: gnosis, explorerAPI: process.env.GNOSISSCAN_API_KEY };
export const scrollChain: ChainConfig = { id: 534352, name: 'Scroll', rpc: scroll, explorerAPI: process.env.SCROLLSCAN_API_KEY };
export const lineaChain: ChainConfig = { id: 59144, name: 'Linea', rpc: linea, explorerAPI: process.env.LINEASCAN_API_KEY };
export const beamChain: ChainConfig = { id: 4337, name: 'Beam', rpc: beam, explorerAPI: process.env.BEAM_API_KEY };
export const sepoliaChain: ChainConfig = { id: 11155111, name: 'Sepolia', rpc: sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const baseSepoliaChain: ChainConfig = { id: 84532, name: 'Base Sepolia', rpc: base_sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const arbitrumSepoliaChain: ChainConfig = { id: 421614, name: 'Arbitrum Sepolia', rpc: arbitrum_sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };
export const optimismSepoliaChain: ChainConfig = { id: 11155420, name: 'OP Sepolia', rpc: optimism_sepolia, explorerAPI: process.env.ETHERSCAN_API_KEY };

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
  sepolia: sepoliaChain,
  base_sepolia: baseSepoliaChain,
  arbitrum_sepolia: arbitrumSepoliaChain,
  optimism_sepolia: optimismSepoliaChain,
};