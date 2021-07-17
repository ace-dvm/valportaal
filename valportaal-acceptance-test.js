// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";


// let SERVER_PORT = process.argv[4];
// let BASE_URL = `http://127.0.0.1:${SERVER_PORT}`;
let BASE_URL = process.argv[4];

import {
    Selector
} from 'testcafe';

fixture `ValPortaal`;

// TODO: make launching of the Webserver the job of the test, and
// TODO: have each test launch a different instance on a different port

test('Check multiple viewers making changes', async t => {
    let url = `${BASE_URL}/index.html`;
    let window1 = await t.openWindow(url);

    let selector = Selector('body');

    // initial check that patient data is rendered
    await t.expect(selector.withText('Val Portaal').exists).ok()
});
