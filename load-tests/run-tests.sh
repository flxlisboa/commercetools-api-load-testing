#! /bin/bash

. ./set-envs.sh

set -e
SCENARIO_NAME="$1"

k6 run --logformat=raw \
--console-output="/tmp/k6_console.log" \
--config="configs/$SCENARIO_NAME.json" \
"src/scenarios/$SCENARIO_NAME.js" | tee output.log

mkdir -p "../results/${CTP_PROJECT_KEY}"
cat output.log | sed '/█/,$!d' > "../results/${CTP_PROJECT_KEY}/${SCENARIO_NAME}_$(date +'%Y-%m-%d_%H-%M-%S').txt"

