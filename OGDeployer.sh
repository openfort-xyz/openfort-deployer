#!/bin/bash

# Global variables
RPC=""
KEY=""

print_ascii_art() {
    echo "\033[32m"  # Green color
    cat << 'EOF'

                                                                                                                                       _               ___                                  
     xxx          -*~*-             ===           +++        `  ___  '        _/7           xxx           &&&           +++           ((_            .'_#_`.    
    (o o)         (o o)            (o o)         (o o)      -  (O o)  -      (o o)         (o o)         (o o)         (o o)         (o o)           |[o o]|       
ooO--(_)--Ooo-ooO--(_)--Ooo----ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo----ooO--(_)--Ooo-



      ░██████     ░██████     ░███████   ░██████████ ░█████████  ░██           ░██████   ░██     ░██ ░██████████ ░█████████                   ░████     ░██   
     ░██   ░██   ░██   ░██    ░██   ░██  ░██         ░██     ░██ ░██          ░██   ░██   ░██   ░██  ░██         ░██     ░██                 ░██ ░██  ░████   
    ░██     ░██ ░██           ░██    ░██ ░██         ░██     ░██ ░██         ░██     ░██   ░██ ░██   ░██         ░██     ░██     ░██    ░██ ░██ ░████   ░██   
    ░██     ░██ ░██  █████    ░██    ░██ ░█████████  ░█████████  ░██         ░██     ░██    ░████    ░█████████  ░█████████      ░██    ░██ ░██░██░██   ░██   
    ░██     ░██ ░██     ██    ░██    ░██ ░██         ░██         ░██         ░██     ░██     ░██     ░██         ░██   ░██        ░██  ░██  ░████ ░██   ░██   
     ░██   ░██   ░██  ░███    ░██   ░██  ░██         ░██         ░██          ░██   ░██      ░██     ░██         ░██    ░██        ░██░██    ░██ ░██    ░██   
      ░██████     ░█████░█    ░███████   ░██████████ ░██         ░██████████   ░██████       ░██     ░██████████ ░██     ░██        ░███      ░████   ░██████ 
                                                                                                                                                         
                                                                                                                                                         
                                                                        ░▒▓███████▓▒░░
                                                                                                                                                         
                                                    ▗▄▄▖ ▄   ▄     ▄▀▀▚▖▄   ▄ ▗▖ ▗▖ ▄▄▄  ▄ ▄▄▄▄  ▗▞▀▚▖ ▄▄▄ 
                                                    ▐▌ ▐▌█   █     █  ▐▌ ▀▄▀  ▐▌▗▞▘█   █ ▄ █   █ ▐▛▀▀▘█    
                                                    ▐▛▀▚▖ ▀▀▀█     █  ▐▌▄▀ ▀▄ ▐▛▚▖ ▀▄▄▄▀ █ █   █ ▝▚▄▄▖█    
                                                    ▐▙▄▞▘▄   █     ▀▄▄▞▘      ▐▌ ▐▌      █                 
                                                        ▀▀▀                                              


     xxx          -*~*-             ===           +++        `  ___  '        _/7           xxx           &&&           +++           ((_            .'_#_`.    
    (o o)         (o o)            (o o)         (o o)      -  (O o)  -      (o o)         (o o)         (o o)         (o o)         (o o)           |[o o]|       
ooO--(_)--Ooo-ooO--(_)--Ooo----ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo-ooO--(_)--Ooo----ooO--(_)--Ooo-                                             
EOF
    echo "\033[0m"  # Reset color
}

deploy_new_chain() {
    echo ""
    echo  "\033[31m"
    echo "=================================================================="
    echo "                    IMPORTANT NOTIFICATION"
    echo "=================================================================="
    echo  "\033[0m"
    echo  "\033[33m"
    echo "Please save/check keystores in path: script/keystore"
    echo "with names freegas.json(EOA) and paymaster.json(Paymaster)"
    echo  "\033[0m"
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                    CONTRACT SELECTION"
    echo "=================================================================="
    echo  "\033[0m"
    echo  "\033[33m"
    echo "Please choose Contract to Deploy from Next List:"
    echo  "\033[0m"
    echo ""
    echo "1. Paymaster with EP V6"
    echo "2. Factory V6"
    echo "3. Implementation"
    echo "4. Back to Main Menu"
    echo ""
    echo  "\033[33m"
    echo "Select an option (1-4): "
    echo  "\033[0m"
    read deploy_choice
    
    case $deploy_choice in
        1)
            deploy_contract "MinimalAccountV2"
            ;;
        2)
            deploy_contract "MinimalAccountV3"
            ;;
        3)
            deploy_contract "MinimalAccountV4"
            ;;
        4)
            main_menu
            ;;
        *)
            echo  "\033[31m"
            echo "Invalid option. Please try again."
            echo  "\033[0m"
            deploy_new_chain
            return
            ;;
    esac
}

verify_contract() {
    echo ""
    echo  "\033[31m"
    echo "=================================================================="
    echo "                    IMPORTANT NOTIFICATION"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "This script will verify deployed contracts."
    echo "Please ensure all details are correct!"
    echo ""
    echo ""
    echo ""
    echo "Enter chain names where contracts were deployed (separated by spaces):"
    echo "mainnet base optimism base_sepolia ..."
    echo ""
    echo ""
    echo "Available networks can be found in: script/deploy-zero/data/RPC.json"
    echo "Use the exact names as they appear in the file."
    echo ""
    echo ""
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                        CHAIN SELECTION"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo "Enter the chain name(s): "
    echo  "\033[0m"
    read chain_input
    
    if [[ -z "$chain_input" ]]; then
        echo  "\033[31m"
        echo "No chain name entered. Please try again."
        echo  "\033[0m"
        verify_contract
        return
    fi
    
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                        Contract Address"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Enter the contract address was deployed: "
    echo  "\033[0m"
    read contract_address
    
    if [[ -z "$contract_address" ]]; then
        echo  "\033[31m"
        echo "No contract address entered. Please try again."
        echo  "\033[0m"
        verify_contract
        return
    fi
    
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                         Contract Path"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Enter path to the contract to verify(<Path>:<Contract Name>): "
    echo  "\033[0m"
    read contract_path
    
    if [[ -z "$contract_path" ]]; then
        echo  "\033[31m"
        echo "No contract path entered. Please try again."
        echo  "\033[0m"
        verify_contract
        return
    fi
    
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                           Constructor"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""    echo  "\033[33m"
    echo "Enter constructor arguments:"
    echo "Example: \$(cast abi-encode \"constructor(address,address,address)\" 0x32080A4dcf6F164E3d0f0C33187c44443B67C919 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 0x6e4a235c5f72a1054abFeb24c7eE6b48AcDe90ab)"
    echo  "\033[0m"
    read constructor_args
    
    if [[ -z "$constructor_args" ]]; then
        echo  "\033[31m"
        echo "No constructor arguments entered. Please try again."
        echo  "\033[0m"
        verify_contract
        return
    fi
    
    local base_command="npx ts-node script/deploy-zero/verify-multi.ts"
    local chain_flags=""
    
    for chain in $chain_input; do
        chain_flags="$chain_flags --$chain"
    done
    
    local final_command="$base_command --address $contract_address --path $contract_path$chain_flags --constructor \"$constructor_args\""
    
    echo ""
    echo  "\033[32m"
    echo "Executing: $final_command"
    echo  "\033[0m"
    
    eval $final_command
    
    echo ""
    main_menu
}

deploy_supported_chain() {
    echo ""
    echo  "\033[31m"
    echo "=================================================================="
    echo "              ⚠️⚠️  IMPORTANT NOTIFICATION ⚠️⚠️"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "This execution will deploy Smart Wallet Account and Contracts you set"
    echo "in file script/deploy-free-gas/utils/ContractsByteCode.ts:"
    echo ""
    echo "    static getAllContracts(): ContractToDeploy[] {"
    echo "        return ["
    echo "            ContractsToDeploy.Name,"
    echo "            ContractsToDeploy.Name,"
    echo "            ..."
    echo "        ];"
    echo "    }"
    echo ""
    echo "This script executes with gas sponsoring and batch deployment."
    echo "In one transaction it deploys all contracts that were set in 'static getAllContracts()'"
    echo ""
    echo "!!! Please use the same Keystore (freegas.json) for future deployments !!!"
    echo  "\033[0m"
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                        CHAIN SELECTION"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Please insert name of the chains with space between the names:"
    echo "mainnet base optimism base_sepolia ....."
    echo ""
    echo ""
    echo "you can find available networks in script/deploy-zero/data/RPC.json"
    echo "please use with same name in the file"
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Enter the chain name(s): "
    echo  "\033[0m"
    read chain_input
    
    if [[ -n "$chain_input" ]]; then
        local base_command="npx ts-node script/deploy-free-gas/index.ts"
        local chain_flags=""
        
        for chain in $chain_input; do
            chain_flags="$chain_flags --$chain"
        done
        
        local final_command="$base_command$chain_flags"
        
        echo ""
        echo  "\033[32m"
        echo "Executing: $final_command"
        echo  "\033[0m"
        
        $final_command
        
        echo ""
        main_menu
    else
        echo  "\033[31m"
        echo "No chain name entered. Please try again."
        echo  "\033[0m"
        deploy_supported_chain
        return
    fi
}

deploy_contract() {
    local contract_name="$1"
    
    echo ""
    echo  "\033[31m"
    echo "=================================================================="
    echo "              ⚠️⚠️  IMPORTANT NOTIFICATION ⚠️⚠️"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Please insert name of the chains with space between the names:"
    echo "mainnet base optimism base_sepolia ....."
    echo ""
    echo ""
    echo "you can find available networks in script/deploy-zero/data/RPC.json"
    echo "please use with same name in the file"
    echo  "\033[0m"
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                        CHAIN SELECTION"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Enter the chain name(s): "
    echo  "\033[0m"
    read chain_input
    
    if [[ -n "$chain_input" ]]; then
        local base_command="npx ts-node script/deploy-zero/index.ts $contract_name"
        local chain_flags=""
        
        for chain in $chain_input; do
            chain_flags="$chain_flags --$chain"
        done
        
        local final_command="$base_command$chain_flags"
        
        echo ""
        echo  "\033[32m"
        echo "Executing: $final_command"
        echo  "\033[0m"
        
        $final_command
        
        echo ""
        deploy_new_chain
    else
        echo  "\033[31m"
        echo "No chain name entered. Please try again."
        echo  "\033[0m"
        deploy_contract "$contract_name"
        return
    fi
}

main_menu() {
    echo ""
    echo  "\033[36m"
    echo "=============================="
    echo "         MAIN MENU"
    echo "=============================="
    echo  "\033[0m"
    echo "1. Deploy on New Chain"
    echo "2. Deploy on Supported Chain"
    echo "3. Verify Contract"
    echo "4. Show Keystores"
    echo "5. Exit"
    echo ""
    echo  "\033[33m"
    echo "Select an option (1-5): "
    echo  "\033[0m"
    read main_choice
    
    case $main_choice in
        1)
            deploy_new_chain
            ;;
        2)
            deploy_supported_chain
            ;;
        3)
            verify_contract
            ;;
        4)
            echo ""
            echo  "\033[32m"
            echo "Checking Keystores..."
            echo  "\033[0m"
            npx ts-node script/keystore/keystoreChecker.ts
            echo ""
            main_menu
            ;;
        5)
            echo ""
            echo  "\033[32m"
            echo "Thank you for using OG Deployer!"
            echo  "\033[0m"
            exit 0
            ;;
        *)
            echo  "\033[31m"
            echo "Invalid option. Please try again."
            echo  "\033[0m"
            main_menu
            return
            ;;
    esac
}

main(){
    print_ascii_art
    main_menu
}

main