encrypt_private_key(){
    echo ""
    echo ""
    echo ""
    echo ""
    echo  "\033[31m"  # Red color
    printf "%*s\n" 85 "=============================="
    printf "%*s\n" 84 "ERC-2335: BLS12-381 Keystore"
    printf "%*s\n" 85 "=============================="
    echo  "\033[0m"  # Reset color
    echo ""
    printf "%*s\n" 95 "A keystore is a mechanism for storing private keys"
    printf "%*s\n" 98 "It is a JSON file that encrypts a private key and is the"
    printf "%*s\n" 98 "standard for interchanging keys between devices as until"
    printf "%*s\n" 95 " a user provides their password, their key is safe."
    echo ""
    echo ""
    
    # Menu options
    printf "1. Use with existing Keystore 🔐"
    echo ""
    printf "2. Import Private Key to Keystore 🔑"
    echo ""
    echo ""
    printf "Select an option (1-2): "
    read keystore_choice
    
    case $keystore_choice in
        1)
            echo ""
            echo "\033[32m"  # Green color
            printf "Available Keystores:"
            echo "\033[0m"  # Reset color
            echo ""
            
            # Show existing keystores
            cast wallet list
            
            echo ""
            printf "Enter Keystore Name: "
            read KEY
            
            if [[ -n "$KEY" ]]; then
                echo ""
                printf "Selected Keystore: $KEY "
            else
                echo "No keystore name entered. Please try again."
                encrypt_private_key
                return
            fi
            ;;
        2)
            echo ""
            echo "\033[32m"  # Green color
            printf "🔑 Paste Here Your Private Key 🔑"
            echo "\033[0m"  # Reset color
            echo ""
            
            make encrypt-key
            
            echo ""
            printf "Enter Keystore Name: "
            read KEY
            
            if [[ -n "$KEY" ]]; then
                echo ""
                printf "Keystore Name: $KEY"
            else
                echo "No keystore name entered. Please try again."
                encrypt_private_key
                return
            fi
            ;;
        *)
            echo "Invalid option. Please try again."
            encrypt_private_key
            return
            ;;
    esac
    
    # Export KEY variable so it can be used in other functions
    export KEY
}

encrypt_private_key