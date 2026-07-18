#!/usr/bin/env sh
curl --fail-with-body http://127.0.0.1:4141/v1/chat \
  --header 'content-type: application/json' \
  --data '{"input":"What time is it?","threadId":"shell-example"}'
