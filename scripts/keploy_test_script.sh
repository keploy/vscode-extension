#!/bin/bash -i

folderpath="$2"
log_file_path="$1"

# Command is all of the CLI args after the 2nd arg
command="${@:3}"

# Create log file if it doesn't exist
touch "$log_file_path"
> "$log_file_path" # Clear the log file

# Set permissions of the log file
chmod 666 "$log_file_path"

if [[ "$command" =~ .*"go".* ]]; then
#   echo "Go is present."
  go mod download
  go build -o application


elif [[ "$command" =~ .*"python3".* ]]; then
  # echo "Python is present, Activating Virtual Environment 🐍"
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

elif [[ "$COMMAND" =~ .*"node".* ]]; then
  echo "Node is present."
  npm install

elif [[ "$COMMAND" =~ .*"java".* ]]  || [[ "$COMMAND" =~ .*"mvn".* ]]; then
  echo "Java is present."
  mvn clean install

fi 

keploycmd="sudo -E env PATH=\"$PATH\" keploybin"


cd "$folderpath"

sudo $keploycmd test -c "$command"  | tee -a "$log_file_path"
