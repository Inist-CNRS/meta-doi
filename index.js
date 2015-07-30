'use strict';

var parser = require('xml2json');
var request = require('request').defaults({
  proxy: process.env.http_proxy ||
         process.env.HTTP_PROXY ||
         process.env.https_proxy ||
         process.env.HTTPS_PROXY
});


/**
 * Query Crossref and get results
 * @param  {Object}   search   the actual query parameters
 * @param  {Object}   doi : doi to search metadata for
 * @param  {Function} callback(err, result)
 */
exports.DOIquery = function (doi, callback) {

  // query link
  // CrossRef https://doi.crossref.org/search/doi?pid=inis:inis708&format=unixsd&doi=10.1016/0735-6757(91)90169-K
  
  var url = 'https://doi.crossref.org/search/doi?pid=inis:inis708&format=unixsd&doi=' + encodeURIComponent(doi);
  console.log(doi);

  request.get(url, function (err, res, body) {
    if (err) { return callback(err); }

    if (res.statusCode !== 200) {
      return callback(new Error('unexpected status code : ' + res.statusCode));
    }

    var info;

    try {
      console.log(parser.toJson(body));
      info = JSON.parse(parser.toJson(body));
    } catch(e) {
      console.log(body);
      return callback(e);
    }

    // if an error is thown, the json should contain the status code and a detailed message
    if (info.error) {
      var error = new Error(info.error.msg || 'got an unknown error from the API');
      error.code = info.error.code;
      return callback(error) ;
    }

    callback(null , info);
  });
};

exports.getPublicationDate = function(crossref_result) {

  var publicationDate = exports.query(doi, callback).crossref_result.query_result.body;
  callback(null , publicationDate);
};
