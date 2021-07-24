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

const advice_filename = 'valportaal-static/advice.html';

async function loadAdvicePage(urlparams="id=3",
        serverPatientAdvice='{ "foo": "bar" }') {
    fetch.mockResponse(serverPatientAdvice);

    let dom = await JSDOM.fromFile(advice_filename,
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

test("Advice page should contain 'loading' before the javascript runs",
        async () => {
    // NB: this is how to load the page without running the page's javascript
    let dom = await JSDOM.fromFile(advice_filename)
    expect(dom.window.document.body.textContent).toEqual(
        expect.stringMatching(/laden.../i));
})

test("Advice page should not contain 'loading' after it has finished loading",
        async () => {
    let dom = await loadAdvicePage();
    expect(dom.window.document.body.textContent).toEqual(
        expect.not.stringMatching(/laden.../i));
})

test("If id==null, display login button",
        async () => {
    let dom = await loadAdvicePage();
    expect(dom.window.document.body.textContent).toEqual(
        expect.stringMatching(/in te loggen/i));

})

// TODO add some tests for logged-in-no-advice state and logged-in-with-advice state

test("format advice", async () => {
    let dom = await loadAdvicePage();
    expect(dom.window.formatAdvice('foo', '')).toBe('<p>foo</p>');
    expect(dom.window.formatAdvice('foo: {{free text stuff }}', 'bar'))
        .toBe('<p>foo: bar</p>');
})
