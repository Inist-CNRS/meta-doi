#!/usr/bin/env node
'use strict';

/**
 * Command used to enrich csv source with meta info from a doi identifi
 *
 */
var metadoi = require('../index.js');
var fs      = require('fs');
var path    = require('path');
var csv     = require('csv');
var yargs   = require('yargs')
  .usage('Enrich a csv with meta information requested from a doi.' +
    '\n  Usage: $0 [-es] [-f file_name | -k doi_key_name | --doi doi_string]')
  .alias('file', 'f')
  .alias('doikey', 'k')
  .alias('extended', 'e')
  .alias('delimiter', 'd')
  .alias('silent', 's')
  .describe('doikey', 'the field name containing doi (default "doi").')
  .describe('delimiter', 'delimiter of the csv file. Defaults to ";".')
  .describe('file', 'A csv file to parse. If absent, will read from standard input.')
  .describe('doi', 'A single doi to resolve.');
var argv = yargs.argv;

// *  from csvextractor

// show usage if --help option is used
if (argv.help || argv.h) {
  yargs.showHelp();
  process.exit(0);
}

var options = {};
var fields  = [];
var doikey  = 'doi'; // default key field for doi identifier

if (argv.doikey) {
  doikey = argv.doikey;
}

if (argv.silent) {
  options.silent = true;
}
if (argv.extended) {
  options.extended = true;
}
if (argv.doi) {
  // request for a single doi
  return metadoi.resolve(argv.doi,
    options,
    function (meta) {
      console.log(meta);
    }
  );
}


var parser = csv.parse({ delimiter: argv.delimiter || ';', columns: true });
var stream = process.stdin;
var buffer = [];
var first  = true;
var busy   = false;

if (argv.file) {
  stream = fs.createReadStream(argv.file);
}

var doiFields  = Object.keys(metadoi.APIgetInfo(null, true));
var baseFields = [];

function resolve(callback) {
  var record = buffer.shift();
  if (record === null) { process.exit(0); }
  if (!record) { return callback(); }

  if (first) {
    for (var p in record) { baseFields.push(p); }
    process.stdout.write(baseFields.concat(doiFields).join(';') + '\n');
    first = false;
  }

  if (!record[doikey]) {
    console.error("Error : doi key field ", doikey, " not found");
    return setImmediate(resolve);
  }

  metadoi.resolve(record[doikey], options, function (err, meta) {
    if (err) { console.error(err); }

    var values = [];
    baseFields.forEach(function (f) {
      values.push(record[f] || '');
    });

    if (typeof meta === 'object') {
      doiFields.forEach(function (f) {
        values.push(meta[f] || '');
      });
    }

    // record fields first and then meta fields
    process.stdout.write(values.join(';') + '\n');

    setTimeout(resolve, 200);
  });
}

stream.pipe(parser)
.on('readable', function () {
  var row = parser.read();
  if (!row) { return; }

  buffer.push(row);
  if (!busy) {
    busy = true;
    resolve(function () {
      busy = false;
    });
  }

}).on('end', function () {
  buffer.push(null);
  if (!busy) { resolve(); }
}).on('error', function (err) {
  console.error(err);
  process.exit(1);
});
