#!/bin/bash
cd /home/kavia/workspace/code-generation/cloud-observability-suite-1847/observability_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

