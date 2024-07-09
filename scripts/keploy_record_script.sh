#!/bin/bash -i

# folderpath="$2"
log_file_path="$1"

# Extract command from keploy.yml
keploy_config="keploy.yml"
if [[ ! -f "$keploy_config" ]]; then
    echo "keploy.yml file not found in the current directory."
    exit 1
fi

command=$(awk '/command:/ { print $2 }' "$keploy_config")
# echo "Command in yml file: $command"

# Check if command is empty
if [[ -z "$command" ]]; then
    echo "Command is not specified in keploy.yml."
    exit 1
fi

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

if [[ "$command" =~ .*"go".* ]]; then
  go mod download
  go build -o application

elif [[ "$command" =~ .*"python3".* ]]; then
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt

elif [[ "$command" =~ .*"python".* ]] ; then
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt

elif [[ "$command" =~ .*"node".* ]]; then
  npm install

elif [[ "$command" =~ .*"java".* ]]  || [[ "$command" =~ .*"mvn".* ]]; then
  mvn clean install
fi 

# Check if running on WSL
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
  export PATH=$(echo "$PATH" | tr ' ' '\n' | grep -v " " | tr '\n' ':')
  keploycmd="sudo -E keploybin"
else
  keploycmd="sudo -E env PATH=\"$PATH\" keploybin"
fi

# Create a named pipe
fifo=$(mktemp -u)
mkfifo "$fifo"

# Background process to read from the named pipe and write to the log file
cat "$fifo" | tee -a "$log_file_path" &
cat_pid=$!

# Dummy background process to keep the parent script running
(while true; do sleep 1; done) &
dummy_pid=$!

# Execute the keploy command, redirecting output to the named pipe
sudo -E $keploycmd record -c "$command" > "$fifo" 2>&1

# Clean up: Wait for keploy command to finish
wait $!

# Terminate the dummy process and the logging process
kill $dummy_pid
wait $cat_pid
rm "$fifo"
