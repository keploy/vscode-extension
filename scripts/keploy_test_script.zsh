#!/bin/zsh -i

folderpath="$2"
log_file_path="$1"

# Command is all of the CLI args after the 2nd arg
command="${@:3}"

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

if [ "$command" = *go* ]; then
#   echo "Go is present."
  go mod download
  go build -o application
fi 

keploycmd="sudo -E env PATH=\"$PATH\" keploy"

cd "$folderpath"

sudo $keploycmd test -c "$command"  | tee -a "$log_file_path"
