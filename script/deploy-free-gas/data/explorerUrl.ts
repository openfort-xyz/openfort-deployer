import chalk from 'chalk'

export const explorer_url = {
    "Ethereum": "https://etherscan.io/",
    "Base": "https://basescan.org/",
    "Arbitrum": "https://arbiscan.io/",
    "BNB": "https://bscscan.com/",
    "Avalanche C-Chain": "https://snowtrace.io/",
    "Polygon": "https://polygonscan.com/",
    "Sonic": "https://sonicscan.org/",
    "Optimism": "https://optimistic.etherscan.io/",
    "Zora": "https://explorer.zora.energy/",
    "Arbitrum Nova": "https://nova.arbiscan.io/",
    "Polygon zkEVM": "https://zkevm.polygonscan.com/",
    "Gnosis": "https://gnosisscan.io/",
    "Scroll": "https://scrollscan.com/",
    "Linea": "https://lineascan.build/",
    "Beam": "https://4337.routescan.io/",
    "Sepolia": "https://sepolia.etherscan.io/",
    "Base Sepolia": "https://sepolia.basescan.org/",
    "Arbitrum Sepolia": "https://sepolia.arbiscan.io/",
    "OP Sepolia": "https://sepolia-optimism.etherscan.io/"
}

export function getExplorerUrl(chainName: string, txHash: string): string {
    const baseUrl = explorer_url[chainName as keyof typeof explorer_url];

    if (!baseUrl) {
        console.warn(chalk.yellow(`Unknown chain: ${chainName}, using default explorer`));
        return `https://etherscan.io/tx/${txHash}`;
    }
    
    return `${baseUrl}tx/${txHash}`;
} 