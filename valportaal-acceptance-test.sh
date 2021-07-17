#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
PORT=9090
BASE_URL="http://127.0.0.1:$PORT"
node ValPortaalServer.js $PORT &
CHILD_PID=%1
sleep 1

./node_modules/.bin/testcafe \
 "firefox:headless" \
 valportaal-acceptance-test.js $BASE_URL
EXIT_CODE=$?

kill $CHILD_PID

exit $EXIT_CODE
