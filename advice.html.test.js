// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";

// Libraries used to Mock the DOM and other browser APIs
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
require('jest-fetch-mock').enableMocks();
beforeEach(() => {
    // reset the mocking behavior before each new test
    fetchMock.resetMocks();
});

// Loads the DOM for the given html file, adding on extra parameters if needed
// (e.g. urlparams="?id=5,foo=2"), enabling the (mocked) fetch function, and
// waiting for the page's code to call the "readyForTesting()" function before
// returning.
async function loadPage(filename, urlparams="") {
    let dom = await JSDOM.fromFile(filename,
        {
            runScripts: "dangerously", // allow scripts (run as user)
            includeNodeLocations: true, // track line numbers for debugging
            resources: "usable" // allow loading of scripts, stylesheets, etc.
        });
    dom.url += urlparams;
    dom.window.fetch = fetch;

    // set window.readyForTesting to a new function and wait for that function
    // to be called by the webpage.
    await new Promise(resolve => { dom.window.readyForTesting = resolve; });

    return dom;
}

const advice_filename = 'valportaal-static/advice.html';

test("Advice page should contain 'loading' before the javascript runs",
        async () => {
    // NB: this is how to load the page without running the page's javascript
    let dom = await JSDOM.fromFile(advice_filename)
    expect(dom.window.document.body.textContent).toEqual(
        expect.stringMatching(/loading/i));
})

test("Advice page should not contain 'loading' after it has finished loading",
        async () => {
    fetch.mockResponse('{ "foo": "bar" }');
    let dom = await loadPage(advice_filename, '?id=3');
    expect(dom.window.document.body.textContent).toEqual(
        expect.not.stringMatching(/loading/i));
})
