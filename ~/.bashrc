# Add Yarn global bin to PATH - use Windows path format
if [ -d "$USERPROFILE/AppData/Local/Yarn/bin" ]; then
    export PATH="$PATH:$USERPROFILE/AppData/Local/Yarn/bin"
fi 