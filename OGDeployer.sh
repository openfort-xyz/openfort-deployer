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
    echo  "\033[31m"
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
            deploy_contract "OpenfortPaymasterV2"
            ;;
        2)
            deploy_contract "UpgradeableOpenfortFactory"
            ;;
        3)
            deploy_contract "UpgradeableOpenfortAccount"
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

deploy_supported_chain() {
    echo ""
    echo  "\033[31m"
    echo "=================================================================="
    echo "              ⚠️⚠️  IMPORTANT NOTIFICATION ⚠️⚠️"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "This script will deploy the Smart Wallet Account and contracts specified in:"
    echo "file >> script/deploy-free-gas/utils/ContractsByteCode.ts:"
    echo ""
    echo "    static getAllContracts(): ContractToDeploy[] {"
    echo "        return ["
    echo "            ContractsToDeploy.Name,"
    echo "            ContractsToDeploy.Name,"
    echo "            ..."
    echo "        ];"
    echo "    }"
    echo ""
    echo "Features:"
    echo "- Gas sponsoring and batch deployment"
    echo "- Single transaction deploys all contracts from 'static getAllContracts()'"
    echo ""
    echo "⚠️   Important: Use the same keystore (freegas.json) for all future deployments   ⚠️"
    echo  "\033[0m"
    echo ""
    echo  "\033[32m"
    echo "=================================================================="
    echo "                        CHAIN SELECTION"
    echo "=================================================================="
    echo  "\033[0m"
    echo ""
    echo  "\033[33m"
    echo "Please enter the chain names separated by spaces:"
    echo "mainet base optimism base_sepolia ..."
    echo ""
    echo ""
    echo "Available networks can be found in: script/deploy-zero/data/RPC.json"
    echo "Use the exact names as they appear in the file."
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
    echo "Please enter the chain names separated by spaces:"
    echo "mainet base optimism base_sepolia ..."
    echo ""
    echo ""
    echo "Available networks can be found in: script/deploy-zero/data/RPC.json"
    echo "Use the exact names as they appear in the file."
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
    echo "3. Show Keystores"
    echo "4. Exit"
    echo ""
    echo  "\033[33m"
    echo "Select an option (1-4): "
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
            echo ""
            echo  "\033[32m"
            echo "Checking Keystores..."
            echo  "\033[0m"
            npx ts-node script/keystore/keystoreChecker.ts
            echo ""
            main_menu
            ;;
        4)
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