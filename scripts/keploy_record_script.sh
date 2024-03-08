#!/bin/bash

# Command to execute
command="$1"
filepath="$2"
log_file_path="$3"

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"
# Check if the current operating system is Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    keploycmd="keploy"
else
    keploycmd="/usr/local/bin/keploybin"
fi
# Execute the keploy record command, redirecting output to the log file
sudo $keploycmd record -c "$command" "$filepath" | tee -a "$log_file_path"
# keploy record -c "/home/akash/Desktop/samples-go/gin-mongo/test-app-url-shortener" | tee -a "$log_file_path" 


