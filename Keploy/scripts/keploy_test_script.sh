
folderpath="$2"
log_file_path="$1"
command="${@:3}"
touch "$log_file_path"
> "$log_file_path" 
chmod 666 "$log_file_path"
keploycmd="/usr/local/bin/keploybin"
if command -v keploy &> /dev/null; then
    keploycmd="keploy"
fi
cd "$folderpath"
sudo $keploycmd $command  | tee -a "$log_file_path"


