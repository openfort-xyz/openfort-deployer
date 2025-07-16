#!/bin/bash

choose_rpc() {
    local RPC_FILE="src/RPC.json"
    
    echo "\033[32m"
    echo ""
    echo "=============================="
    echo "        RPC Selection"
    echo "=============================="
    echo "\033[0m"
    echo "1. Choose from RPC List"
    echo "2. Insert Your Custom RPC"
    echo "\033[33m"
    echo "Select an option (1-2): "
    echo "\033[0m"
    read main_choice

    case $main_choice in
        1)
            echo ""
            echo "\033[32m"
            echo "=============================="
            echo "      Available RPCs"
            echo "=============================="
            echo " Available RPC from Chainlist"
            echo "     Check src/RPC.json"
            echo "\033[0m"
            
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
            echo "\033[33m"
            echo "Select RPC (1-$((counter-1))): "
            echo "\033[0m"
            read rpc_choice
            
            # Validate choice
            if [[ $rpc_choice -ge 1 && $rpc_choice -le $((counter-1)) ]]; then
                RPC="${rpc_urls[$((rpc_choice-1))]}"
                echo ""
                echo "Selected RPC: ${rpc_names[$((rpc_choice-1))]}"
                echo "URL: $RPC"
            else
                echo "\033[33m"
                echo "Invalid choice. Please try again."
                echo "\033[0m"
                choose_rpc
                return
            fi
            ;;
        2)
            echo ""
            echo "\033[32m"
            echo "=============================="
            echo "     Custom RPC Input"
            echo "=============================="
            echo "\033[0m"
            echo "\033[33m"
            echo "Insert Your RPC URL https://: "
            echo "\033[0m"
            read custom_rpc
            
            if [[ -n "$custom_rpc" ]]; then
                RPC="$custom_rpc"
                echo ""
                echo "Custom RPC set: $RPC"
            else
                echo "\033[31m"
                echo "No RPC entered. Please try again."
                echo "\033[0m"
                choose_rpc
                return
            fi
            ;;
        *)
            echo "\033[31m"
            echo "Invalid option. Please try again."
            echo "\033[0m"
            choose_rpc
            return
            ;;
    esac
    
    # Export RPC variable so it can be used in other functions
    export RPC
}

# Test the function
choose_rpc
echo ""
echo "Final RPC value: $RPC"
