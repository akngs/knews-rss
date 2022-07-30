#!/usr/bin/env bash
SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_HOME="$( dirname ${SCRIPT_HOME} )"

cd ${PROJECT_HOME}
deno run --allow-net --allow-read --allow-write src/merge.ts