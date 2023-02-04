// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";

const SKIP_BOGUS_OAUTH = parseInt(process.env.SKIP_BOGUS_OAUTH);
const boauth = require('./oauth2test/bogus-oauth-server');

if (SKIP_BOGUS_OAUTH) {
    console.log("skipping start of bogus oauth sever, SKIP_BOGUS_OAUTH =",
        SKIP_BOGUS_OAUTH);
} else {
    let bogus = boauth.bogus_oauth_server(9876);
}

const vp = require('./ValPortaalServer');
let server = vp.createServer();
