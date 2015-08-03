'use strict';

var metadoi = require('../index.js');
var cfg   = require('../config.json');

// find geoloalization from IP
exports.resolve = function (doi, options, cb) {
  var r = {};

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




