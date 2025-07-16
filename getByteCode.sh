#!/bin/bash

# Default values
path=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --path)
            path="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if path is provided
if [ -z "$path" ]; then
    echo "Error: --path is required"
    echo "Usage: $0 --path <contract_path>"
    exit 1
fi

# Execute the command
forge inspect "$path" bytecode