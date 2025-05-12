#!/bin/bash

# Check if fzf is installed
if ! command -v fzf &> /dev/null
then
  echo "fzf could not be found. Please install fzf before running this script. ( sudo apt install fzf )"
  exit 1
fi


rm -rf dist .parcel-cache

# On récupère les apps dans micro-apps
apps_dir="micro-apps"
apps=$(ls "$apps_dir")

# On selectionne les apps à build
selected_apps=$(echo "$apps" | fzf --multi --prompt="Select apps to build: ")

if [ -z "$selected_apps" ]; then
  echo "No apps selected. Exiting."
  exit 1
fi


# On loop sur les apps en injectant micro-apps/app_name/index.html
entrypoints=""
for app in $selected_apps; do
  entrypoints+="micro-apps/$app/index.html "
done

echo "Serving the following apps:"
echo "$selected_apps"


parcel serve index.html $entrypoints --dist-dir dist/