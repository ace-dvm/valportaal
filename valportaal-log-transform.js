// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2021 S. K. Medlock, E. K. Herman, K. M. Shaw
// vim: set sts=4 shiftwidth=4 expandtab :
"use strict";
const fs = require('fs');
const readline = require('readline');


const IN = process.argv[2];
const OUT = process.argv[3];

let ids_seen = {};

const reader = readline.createInterface({
    input: fs.createReadStream(IN),
    output: process.stdout,
    terminal: false
});

const writer = fs.createWriteStream(OUT, {
    flags: 'a'
});

reader.on('line', (line) => {
    let delim_idx = line.indexOf('-');
    let id = line.substring(0, delim_idx).trim();
    if (!ids_seen[id]) {
        ids_seen[id] = Object.keys(ids_seen).length + 1;
    }
    let new_line = "" + ids_seen[id] + " " +
        line.substring(delim_idx, line.length) + "\n";

    writer.write(new_line);
});

reader.on('close', function() {
    writer.end();
});
