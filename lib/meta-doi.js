'use strict';

var metadoi = require('../index.js');
var cfg   = require('../config.json');

var metaFields = [
  'doi-publication-title',
  'doi-publication-date-year'
];

var metaDefaultFields = [
  'doi-publication-title',
  'doi-publication-date-year',
  'geoip-longitude'
];

var metaSeparator = cfg['csv-separator'];

exports.metaFields = metaFields;
exports.metaDefaultFields = metaDefaultFields;

// find geoloalization from IP
exports.resolve = function (doi, options, cb) {
  var r = {};

  if (doi) {
    doi = doi.trim();
  } else {
    return cb(r);
  }

  metadoi.APIquery(doi, function (err, doc) {
    if (err) {
      console.error("Error : " + err);
      return cb(err);;
    }
    if (doc !== null) {
      r = metadoi.APIgetInfo(doc, options.extended);
    }
    return cb(r);
  });
};




