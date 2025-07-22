const pimlico_rpc = {
    'Ethereum':           'https://api.pimlico.io/v2/mainnet/rpc?apikey=',
    'Base':               'https://api.pimlico.io/v2/base/rpc?apikey=',
    'Arbitrum':           'https://api.pimlico.io/v2/arbitrum/rpc?apikey=',
    'BNB':                'https://api.pimlico.io/v2/bsc/rpc?apikey=',
    'Avalanche C-Chain':  'https://api.pimlico.io/v2/avalanche/rpc?apikey=',
    'Polygon':            'https://api.pimlico.io/v2/polygon/rpc?apikey=',
    'Sonic':              'UNSUPPORTED',
    'Optimism':           'https://api.pimlico.io/v2/optimism/rpc?apikey=',
    'Zora':               'UNSUPPORTED',
    'Arbitrum Nova':      'https://api.pimlico.io/v2/arbitrum-nova/rpc?apikey=',
    'Polygon zkEVM':      'https://api.pimlico.io/v2/polygon-zkevm/rpc?apikey=',
    'Gnosis':             'https://api.pimlico.io/v2/gnosis/rpc?apikey=',
    'Scroll':             'https://api.pimlico.io/v2/scroll/rpc?apikey=',
    'Linea':              'https://api.pimlico.io/v2/linea/rpc?apikey=',
    'Beam':               'UNSUPPORTED',
    'Sepolia':            'https://api.pimlico.io/v2/sepolia/rpc?apikey=',
    'Base Sepolia':       'https://api.pimlico.io/v2/base-sepolia/rpc?apikey=',
    'Arbitrum Sepolia':   'https://api.pimlico.io/v2/arbitrum-sepolia/rpc?apikey=',
    'OP Sepolia':         'https://api.pimlico.io/v2/optimism-sepolia/rpc?apikey=',
  } as const;

export async function getPimlicoUrl(chainName: string): Promise<string> {
    return pimlico_rpc[chainName as keyof typeof pimlico_rpc];;
}