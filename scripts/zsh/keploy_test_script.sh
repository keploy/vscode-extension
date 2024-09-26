#!/bin/zsh

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

# Check if running on WSL
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
  sudo -E env "PATH=$PATH" keploy test | tee -a "$log_file_path"
else
  keploycmd="sudo -E env PATH=\"$PATH\" keploy"
  eval $keploycmd test | tee -a "$log_file_path"
fi