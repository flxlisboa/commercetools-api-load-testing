#! /bin/bash

set -e

# https://cloud.google.com/sdk/docs/downloads-interactive
curl https://sdk.cloud.google.com > install.sh
bash install.sh --disable-prompts

# restarts shell to update PATH
exec -l $SHELL
