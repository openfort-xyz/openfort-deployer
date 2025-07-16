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

encrypt_private_key(){
    echo ""
    echo ""
    echo ""
    echo  "\033[31m"  # Red color
    printf "%*s\n" 95 "=============================="
    printf "%*s\n" 94 "ERC-2335: BLS12-381 Keystore"
    printf "%*s\n" 95 "=============================="
    echo  "\033[0m"  # Reset color
    echo ""
    printf "%*s\n" 105 "A keystore is a mechanism for storing private keys"
    printf "%*s\n" 108 "It is a JSON file that encrypts a private key and is the"
    printf "%*s\n" 108 "standard for interchanging keys between devices as until"
    printf "%*s\n" 105 " a user provides their password, their key is safe."
    echo ""
    echo ""
    
    # Menu options
    printf "1. Use with existing Keystore 🔐"
    echo ""
    printf "2. Import Private Key to Keystore 🔑"
    echo ""
    printf "3. Back to Main Menu"
    echo ""
    echo ""
    printf "Select an option (1-3): "
    read keystore_choice
    
    case $keystore_choice in
        1)
            echo ""
            echo  "\033[32m"  # Green color
            printf "Available Keystores:"
            echo  "\033[0m"  # Reset color
            echo ""
            
            # Show existing keystores
            cast wallet list
            
            echo ""
            printf "Enter Keystore Name: "
            read KEY
            
            if [[ -n "$KEY" ]]; then
                echo ""
                printf "Selected Keystore: $KEY "
                echo ""
                main_menu
            else
                echo "No keystore name entered. Please try again."
                encrypt_private_key
                return
            fi
            ;;
        2)
            echo ""
            echo  "\033[32m"  # Green color
            printf "🔑 Paste Here Your Private Key 🔑"
            echo  "\033[0m"  # Reset color
            echo ""
            
            make encrypt-key
            
            echo ""
            printf "Enter Keystore Name: "
            read KEY
            
            if [[ -n "$KEY" ]]; then
                echo ""
                printf "Keystore Name: $KEY"
                echo ""
                main_menu
            else
                echo "No keystore name entered. Please try again."
                encrypt_private_key
                return
            fi
            ;;
        3)
            main_menu
            ;;
        *)
            echo "Invalid option. Please try again."
            encrypt_private_key
            return
            ;;
    esac
}

choose_rpc() {
    local RPC_FILE="script/data/RPC.json"
    
    echo  "\033[32m"
    echo ""
    echo "=============================="
    echo "        RPC Selection"
    echo "=============================="
    echo  "\033[0m"
    echo "1. Choose from RPC List"
    echo "2. Insert Your Custom RPC"
    echo "3. Back to Main Menu"
    echo  "\033[33m"
    echo "Select an option (1-3): "
    echo  "\033[0m"
    read main_choice

    case $main_choice in
        1)
            echo ""
            echo  "\033[32m"
            echo "=============================="
            echo "      Available RPCs"
            echo "=============================="
            echo " Available RPC from Chainlist"
            echo "  Check script/data/RPC.json"
            echo  "\033[0m"
            
            # Read and display RPCs from JSON file
            local counter=1
            local rpc_names=()
            local rpc_urls=()
            
            # Parse JSON file and create arrays
            while IFS= read -r line; do
                if [[ $line =~ \"([^\"]+)\":[[:space:]]*\"([^\"]+)\" ]]; then
                    rpc_names+=("${BASH_REMATCH[1]}")
                    rpc_urls+=("${BASH_REMATCH[2]}")
                    printf "%2d. %s\n" $counter "${BASH_REMATCH[1]}"
                    ((counter++))
                fi
            done < "$RPC_FILE"
            
            echo ""
            echo  "\033[33m"
            echo "Select RPC (1-$((counter-1))): "
            echo  "\033[0m"
            read rpc_choice
            
            # Validate choice
            if [[ $rpc_choice -ge 1 && $rpc_choice -le $((counter-1)) ]]; then
                RPC="${rpc_urls[$((rpc_choice-1))]}"
                echo ""
                echo "Selected RPC: ${rpc_names[$((rpc_choice-1))]}"
                echo "URL: $RPC"
                echo ""
                main_menu
            else
                echo  "\033[33m"
                echo "Invalid choice. Please try again."
                echo  "\033[0m"
                choose_rpc
                return
            fi
            ;;
        2)
            echo ""
            echo  "\033[32m"
            echo "=============================="
            echo "     Custom RPC Input"
            echo "=============================="
            echo  "\033[0m"
            echo  "\033[33m"
            echo "Insert Your RPC URL https://: "
            echo  "\033[0m"
            read custom_rpc
            
            if [[ -n "$custom_rpc" ]]; then
                RPC="$custom_rpc"
                echo ""
                echo "Custom RPC set: $RPC"
                echo ""
                main_menu
            else
                echo  "\033[31m"
                echo "No RPC entered. Please try again."
                echo  "\033[0m"
                choose_rpc
                return
            fi
            ;;
        3)
            main_menu
            ;;
        *)
            echo  "\033[31m"
            echo "Invalid option. Please try again."
            echo  "\033[0m"
            choose_rpc
            return
            ;;
    esac
}

compute_address_factory_v6(){
    echo ""
    echo  "\033[33m"
    echo "=============================="
    echo "   Compute Factory V6 Address"
    echo "=============================="
    echo  "\033[0m"
    echo "Please check .env and insert correct 'FACTORY_V6_SALT(byte32)'"
    echo ""
    echo "\033[36m"
    echo "Press Enter to continue after filling .env file..."
    echo "\033[0m"
    read -p ""
    echo ""
    make compute-factory-v6-address
    echo ""
    echo  "\033[31m"
    echo "if MISMATCH: Need to adjust salt or deployer -> .env"
    echo  "\033[0m"
    echo ""
    deploy_factory_v6_menu
}

deploy_factory_v6_action() {
    echo ""
    echo  "\033[33m"
    echo "Deploying Factory V6 to chain..."
    echo  "\033[0m"
    echo "Will Be Soon"
    echo ""
    deploy_factory_v6_menu
}

deploy_factory_v6_menu() {
    echo ""
    echo  "\033[32m"
    echo "=============================="
    echo "     Deploy Factory V6"
    echo "=============================="
    echo  "\033[0m"
    echo "1. Compute Address with Create2"
    echo "2. Deploy To Chain"
    echo "3. Back to Deployment Menu"
    echo "4. Back to Main Menu"
    echo ""
    echo  "\033[33m"
    echo "Select an option (1-4): "
    echo  "\033[0m"
    read factory_choice
    
    case $factory_choice in
        1)
            compute_address_factory_v6
            ;;
        2)
            deploy_factory_v6_action
            ;;
        3)
            deployment
            ;;
        4)
            main_menu
            ;;
        *)
            echo  "\033[31m"
            echo "Invalid option. Please try again."
            echo  "\033[0m"
            deploy_factory_v6_menu
            return
            ;;
    esac
}

deployment() {
    echo ""
    echo  "\033[32m"
    echo "=============================="
    echo "      Deployment Menu"
    echo "=============================="
    echo  "\033[0m"
    echo "1. Deploy Factory V6"
    echo "2. Deploy Paymaster"
    echo "3. Back to Main Menu"
    echo ""
    echo  "\033[33m"
    echo "Select an option (1-3): "
    echo  "\033[0m"
    read deploy_choice
    
    case $deploy_choice in
        1)
            deploy_factory_v6_menu
            ;;
        2)
            echo ""
            echo  "\033[33m"
            echo "Deploying Paymaster..."
            echo  "\033[0m"
            echo "Will Be Soon"
            echo ""
            deployment
            ;;
        3)
            main_menu
            ;;
        *)
            echo  "\033[31m"
            echo "Invalid option. Please try again."
            echo  "\033[0m"
            deployment
            return
            ;;
    esac
}

main_menu() {
    echo ""
    echo  "\033[36m"
    echo "=============================="
    echo "         MAIN MENU"
    echo "=============================="
    echo  "\033[0m"
    echo "1. Setup Keystore"
    echo "2. Choose RPC"
    echo "3. Deployment"
    echo "4. Exit"
    echo ""
    echo  "\033[33m"
    echo "Select an option (1-4): "
    echo  "\033[0m"
    read main_choice
    
    case $main_choice in
        1)
            encrypt_private_key
            ;;
        2)
            choose_rpc
            ;;
        3)
            deployment
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