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

async function loadAdvicePage(urlparams='', serverPatientAdvice='') {
    fetch.mockResponse(serverPatientAdvice);

    let dom = await JSDOM.fromFile(advice_filename,
        {
            runScripts: "dangerously", // allow scripts (run as user)
            includeNodeLocations: true, // track line numbers for debugging
            resources: "usable", // allow loading of scripts, stylesheets, etc.
        });
    dom.url += urlparams;
    console.log(dom.window.document.body.textContent);
    console.log(JSON.stringify(dom, null, 4));
    dom.window.fetch = fetch;


    // advicePageLoad() is typically called by page load,
    // but we need to set the fetch first
    // await dom.window.foo(); //advicePageLoad();

    return dom;
}

if (0) {
test("Advice page should contain 'loading' before the javascript runs",
        async () => {
    // NB: this is how to load the page without running the page's javascript
    let dom = await JSDOM.fromFile(advice_filename)
    expect(dom.window.document.body.textContent).toEqual(
        expect.stringMatching(/laden.../i));
});

test("Advice page should not contain 'loading' after it has finished loading",
        async () => {
    let dom = await loadAdvicePage("", "");
    expect(dom.window.document.body.textContent).toEqual(
        expect.not.stringMatching(/laden.../i));
});

test("If id==null, display login button",
        async () => {
    let dom = await loadAdvicePage("", "");
    expect(dom.window.document.body.textContent).toEqual(
        expect.stringMatching(/in te loggen/i)
    );
});

test("Advice page without patient data should not contain a login",
        async () => {
    let dom = await loadAdvicePage("id=3", `{
        patient_id: 3,
        patient_advice: []
    }`);

    expect(dom.window.document.body.textContent).toEqual(
        expect.not.stringMatching(/in te loggen/i)
    );
});

test("Advice page without patient data should contain 'geen persoon'",
        async () => {
    let dom = await loadAdvicePage("id=3", `{
        patient_id: 3,
        patient_advice: []
    }`);
    expect(dom.window.document.body.textContent).toEqual(
        expect.stringMatching(/geen persoon/i)
    );
});

// TODO add some tests for logged-in-with-advice state
}

test("format advice", async () => {
    let dom = await loadAdvicePage();
    expect(dom.window.formatAdvice('foo', '')).toBe('<p>foo</p>');
    expect(dom.window.formatAdvice('foo: {{free text stuff }}', 'bar'))
        .toBe('<p>foo: bar</p>');
});
