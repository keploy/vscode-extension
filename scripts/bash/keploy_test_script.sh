#!/bin/bash -i

# folderpath="$2"
log_file_path="$1"

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

# Extract the command from keploy.yml
command=$(awk -F: '/command:/ {gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2}' keploy.yml)
# echo "Command in yml file: $command"

# echo "Command in yml file: $command"
if [[ "$command" =~ .*"go".* ]]; then
  # echo "Go is present."
  go mod download
  go build -o application

elif [[ "$command" =~ .*"python3".* ]]; then
  # echo "Python 3 is present, Activating Virtual Environment 🐍"
  python3 -m venv venv
  source venv/bin/activate
  # echo 'Installing requirements 📦'
  pip install -r requirements.txt
  # echo 'Test Mode Starting 🎉'

elif [[ "$command" =~ .*"python".* ]] ; then
  # echo "Python is present, Activating Virtual Environment 🐍"
  python -m venv venv
  source venv/bin/activate
  # echo 'Installing requirements 📦'
  pip install -r requirements.txt
  # echo 'Test Mode Starting 🎉'

elif [[ "$command" =~ .*"node".* ]]; then
  # echo "Node is present."
  npm install

elif [[ "$command" =~ .*"java".* ]]  || [[ "$command" =~ .*"mvn".* ]]; then
  # echo "Java is present."
  mvn clean install

fi 

# Check if running on WSL
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
  # echo "Running on WSL"
  # Temporarily modify PATH
  export PATH=$(echo "$PATH" | tr ' ' '\n' | grep -v " " | tr '\n' ':')
  keploycmd="sudo -E keploy"
else
  # echo "Not running on WSL"
  # Original PATH handling
  keploycmd="sudo -E env PATH=\"$PATH\" keploy"
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

# Function to Terminate the dummy process and the logging process
kill_all() {
  kill $dummy_pid
  rm -f "$fifo"
}

# Execute the keploy command with the trap, redirecting output to the named pipe
(
  trap 'kill_all' SIGINT SIGTERM EXIT
  sudo -E $keploycmd test > "$fifo" 2>&1
)

# Clean up: Wait for keploy command to finish
wait $!
touch ./log_file.txt
 
