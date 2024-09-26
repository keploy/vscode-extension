#!/bin/zsh -i

log_file_path="$1"

# Create log file if it doesn't exist
touch "$log_file_path"
: > "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

# Extract the command from keploy.yml
command=$(awk -F: '/command:/ {gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2}' keploy.yml)

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

# Create a named pipe
fifo=$(mktemp -u)
mkfifo "$fifo"

# Disable job control messages
set +m

# Background process to read from the named pipe and write to the log file
cat "$fifo" | tee -a "$log_file_path" &
cat_pid=$!

# Dummy background process to keep the parent script running
(while true; do sleep 1; done) &
dummy_pid=$!

# Function to Terminate the dummy process and the logging process
kill_all() {
  kill $dummy_pid 2>/dev/null
  rm -f "$fifo"
}

# Check if running on WSL
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
  (
    trap 'kill_all' SIGINT SIGTERM
    sudo -E env "PATH=$PATH" keploy test  > "$fifo" 2>&1
  )
else
  keploycmd="sudo -E env PATH=\"$PATH\" keploy"
  (
    trap 'kill_all' SIGINT SIGTERM
    eval $keploycmd test > "$fifo" 2>&1
  )
fi

# Clean up: Wait for keploy command to finish
wait $! 