'use strict';

/*
* Command used to enrich csv source with meta info from a doi identifi
*
* */
var csvextractor = require('../../lib/csvextractor.js');
var metadoi = require('../../lib/meta-doi.js');
require('sugar'); // add more methods to Objects (like merge)
var yargs = require('yargs')
  .usage('Enrich a csv with meta information requested from a doi.' +
    '\n  Usage: $0 [-es] [-f file_name | -k doi_key_name | --doi doi_string]')
  .alias('file', 'f')
  .alias('doikey', 'k')
  .alias('extended', 'e')
  .alias('silent', 's')
  .describe('doikey', 'the field name containing doi (default "doi").')
  .describe('file', 'A csv file to parse. If absent, will read from standard input.')
  .describe('doi', 'A single doi to resolve.')
  ;
var argv = yargs.argv;

// *  from csvextractor

// show usage if --help option is used
if (argv.help || argv.h) {
  yargs.showHelp();
  process.exit(0);
}

var options = {};
var fields  = [];
var source = argv.file ? argv.file : process.stdin;
var doikey = 'doi'; // default key field for doi identifier

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
  metadoi.resolve(argv.doi,
    options,
    function (meta) {
      console.log(meta);
    }
  );
} else {
  // by default csv
  csvextractor.extract(source, fields, function (err, records) {
    if (err) {
      console.error(err); // just notify the error and continue
    }
    // csv header line with keys from first record
    var first = records[0];
    metadoi.resolve(first[doikey],
      options,
      function (meta) {
        // record fields first and then meta-doi fields
        process.stdout.write(Object.keys(first).join(';')
          + ';' + Object.keys(meta).join(';') + '\n');
        // all other records
        records.forEach(function (record) {
          if (Object.keys(record).indexOf(doikey) === -1) {
            console.error("Error : doi key field ", doikey, " not found");
            return;
          }
          metadoi.resolve(record[doikey],
            options,
            function (meta) {
              // record fields first and then meta fields
              process.stdout.write(Object.values(record).join(';')
              + ';' + Object.values(meta).join(';') + '\n');
            }
          );
        });
      }
    );
  }, options);
}
