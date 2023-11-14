// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";

// TODO: make starting and stopping the AdficeWebserver much more friendly
// for testing.

const http = require('http');
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const crypto = require('crypto');

const PORT = process.argv[2] || process.env.PORT || 9090;
console.log('PORT: ', PORT);

const DEBUG = ((process.env.DEBUG !== undefined) &&
    (process.env.DEBUG !== "0"));
console.log('DEBUG: ', DEBUG);

let render_count = 0;

async function renderIndex(req, res) {
    res.render("index"); //.ejs
}

let vp = require('./valportaal').valportaal_init();

async function readEnvFile() {
    let env_file_path = process.env.VALPORTAAL_ENV_PATH || 'valportaal.env';
    let envfile = {};
    try {
        envfile = await dotenv.parse(fs.readFileSync(env_file_path));
    } catch (error) /* istanbul ignore next */ {
        console.log(error);
    }
    return envfile;
}

async function readFromEnvFile(property_name) {
    let envfile = await readEnvFile();
    return envfile[property_name];
}

async function readLoginURL() {
    return readFromEnvFile("LOGIN_URL");
}

async function readClientId() {
    return readFromEnvFile("CLIENT_ID");
}

async function readClientSecret() {
    return readFromEnvFile("CLIENT_SECRET");
}

async function readAuthURL() {
    return readFromEnvFile("AUTH_URL");
}

async function readResourceURL() {
    return readFromEnvFile("RESOURCE_URL");
}

async function readOauthUserId() {
    return readFromEnvFile("OAUTH_USER_ID");
}
async function readOauthPassword() {
    return readFromEnvFile("OAUTH_USER_PW");
}

async function getAdviceJSON(req, res) {
    let patient_id = 0;
    let code = req.query.code || 0;
    if (code) {
        let client_id = await readClientId();
        let client_secret = await readClientSecret();
        let user_id = readOauthUserId();
        let user_pw = readOauthPassword();
        let user_auth = user_id + ':' + user_pw;
        let user_auth_base64 = Buffer.from(user_auth).toString('base64');

        let body_data = {
            code: code,
            client_id: client_id,
        };
        let headers = {
                Authorization: 'Basic ' + user_auth_base64
        }
        let options = {
            method: 'POST',
            body: body_data,
            headers: headers,
        };
        let url = await readAuthURL(); // post
        let post_response_content = await fetch(url, options);
        let post_response_json = await post_response_content.text();
        let post_response = JSON.parse(post_response_json);
        let access_token = post_response.access_token;
        let token_type = post_response.token_type;
        let expires_in = post_response.expires_in;

        url = await readResourceURL(); // post
        body_data = {};
        options = {
            method: 'POST',
            headers: { Authorization: token_type + ' ' + access_token, },
            body: body_data,
        };
        post_response_content = await fetch(url, options);
        post_response_json = await post_response_content.text();
        post_response = JSON.parse(post_response_json);
        let uid = post_response.uid;

        patient_id = await vp.getPatientId(uid);
        req.session.cookie.patient_id = patient_id;
    } else {
        patient_id = req.session.cookie.patient_id;
    }
    if (!patient_id) {
        res.redirect('/static/auth.html'); // TODO: "login failed" msg param?
        return;
    }
    let patient_advice = await vp.getAdviceForPatient(patient_id);
    res.json({
        patient_id: patient_id,
        patient_advice: patient_advice
    });
}

async function doLogin(req, res) {
    let login_url = await readLoginURL();
    res.redirect(login_url);
}

process.on('exit', function() {
    console.log('server is not listening on ' + PORT);
});

function createServer() {
let app = express();

const cookie_secret = crypto.randomBytes(16).toString('hex');

let max_session_ms = 10 * 60 * 1000; // 10 minutes
var session_manager = session({
    secret: cookie_secret,
    cookie: {
        maxAge: max_session_ms
    }
});
app.use(session_manager);

app.set('views', ['./valportaal-express-views', ]);
const server = http.createServer(app);

app.use("/static", express.static('valportaal-static'));
app.use("/adfice_it", express.static('valportaal-adfice'));
app.set('view engine', 'ejs');

app.get("/", renderIndex);
app.get("/index", renderIndex);
app.get("/index.html", renderIndex);

app.get("/advice", getAdviceJSON);

app.get("/login", doLogin);

server.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
});

server.on('close', function() {
    console.log(`closing server running on ${PORT}`);
});
return server;
}

module.exports = {
    createServer: createServer,
}
