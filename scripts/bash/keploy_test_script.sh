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

# echo "Keploy command: $keploycmd"

# cd "$folderpath"

# Execute the keploy command and append the output to the log file
sudo $keploycmd test | tee -a "$log_file_path"
touch ./log_file.txt
 
