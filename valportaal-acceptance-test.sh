#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
PORT=$(node bin/free-port.js)
if [ "_${PORT}_" == "__" ] || [ $PORT -lt 1024 ]; then
        PORT=$(bin/free-port)
fi
BASE_URL="http://127.0.0.1:$PORT"
export SKIP_BOGUS_OAUTH=$(ss -ln | grep -c 9876)
node valportaal-webserver-runner.js $PORT &
CHILD_PID=%1
sleep 1

./node_modules/.bin/testcafe \
 "firefox:headless" \
 valportaal-acceptance-test.js $BASE_URL
EXIT_CODE=$?

kill $CHILD_PID

exit $EXIT_CODE
