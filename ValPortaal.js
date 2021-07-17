// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";

// TODO: make starting and stopping the AdficeWebserver much more friendly
// for testing.

let http = require('http');
let express = require('express');
let ejs = require('ejs');

const PORT = process.argv[2] || process.env.PORT || 8080;
console.log('PORT: ', PORT);

const DEBUG = ((process.env.DEBUG !== undefined) &&
    (process.env.DEBUG !== "0"));
console.log('DEBUG: ', DEBUG);

let render_count = 0;

async function renderIndex(req, res) {
    res.render("index"); //.ejs
}

process.on('exit', function() {
    console.log('server is not listening on ' + PORT);
});

let app = express();
app.set('views', ['./valportaal-express-views',]);
const server = http.createServer(app);

app.use("/static", express.static('static'));
app.set('view engine', 'ejs');

app.get("/", renderIndex);
app.get("/index", renderIndex);
app.get("/index.html", renderIndex);

server.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
});

server.on('close', function() {
    console.log(`closing server running on ${PORT}`);
});
