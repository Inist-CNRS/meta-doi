'use strict';

var parser = require('xml2json');
var request = require('request').defaults({
  proxy: process.env.http_proxy ||
         process.env.HTTP_PROXY ||
         process.env.https_proxy ||
         process.env.HTTPS_PROXY
});
var config = require('./lib/config.js');
var pid;

// load credentials for DOI requests
if (config.pid) {
  pid = config.pid;
} else {
  console.error("Pid undefined ! needed for DOI requests");
  console.error("You can only use API requests");  
}

/**
 * Query Crossref and get results
 * @param  {Object}   search   the actual query parameters
 * @param  {Object}   doi : doi to search metadata for
 * @param  {Function} callback(err, result)
 */
exports.DOIquery = function (doi, callback) {

  // query link
  // CrossRef https://doi.crossref.org/search/doi?pid=inis:inis708&format=unixsd&doi=10.1016/0735-6757(91)90169-K
  // 
 
  var url = 'https://doi.crossref.org/search/doi?pid=' + pid + '&format=unixsd&doi=' + encodeURIComponent(doi);

  request.get(url, function (err, res, body) {
    if (err) { return callback(err); }

    if (res.statusCode === 401) {
      return callback(new Error('Unauthorized status code (' + res.statusCode + ') check your credentials'));
    } else if (res.statusCode !== 200) {
      console.error(url);
      return callback(new Error('Unexpected status code : ' + res.statusCode));
    }

    var info;

    try {
      //console.log(parser.toJson(body));
      info = JSON.parse(parser.toJson(body));
    } catch(e) {
      //console.log(body);
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

/**
 * Query Crossref and get results
 * @param  {Object}   search   the actual query parameters
 * @param  {Object}   doi : doi to search metadata for
 * @param  {Function} callback(err, result)
 */
exports.APIquery = function (doi, callback) {

  // query link
  // CrossRef https://doi.crossref.org/search/doi?pid=inis:inis708&format=unixsd&doi=10.1016/0735-6757(91)90169-K
  
  var url = 'http://api.crossref.org/works/' + encodeURIComponent(doi);
  //console.log(doi);

  request.get(url, function (err, res, body) {
    if (err) { return callback(err); }

    if (res.statusCode === 404) {
      // doi not found
      return callback(null, {});
    } else if (res.statusCode !== 200) {
      console.error(url);
      return callback(new Error('unexpected status code : ' + res.statusCode));
    }

    var info;

    try {
      //console.log(body);
      info = JSON.parse(body);
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

exports.APIgetPublicationDateYear = function(api_result) {
  if (api_result.message !== undefined 
    && api_result.message.issued !== undefined) {
    return(api_result.message.issued['date-parts'][0][0]);
  }
  return({});
};

exports.APIgetPublicationTitle = function(api_result) {
  if (api_result.message !== undefined 
   && typeof api_result.message['container-title'] !== undefined) {
    return(api_result.message['container-title'][0]);
  }
  return({});
};

exports.APIgetInfo = function(api_result, extended) {
  var info = {};

  if (api_result.message !== undefined) {
    if (typeof api_result.message['container-title'] !== undefined) {
      // search standard information
      info['doi-publication-title'] = api_result.message['container-title'];
      info['doi-publication-date-year'] = api_result.message.issued['date-parts'][0][0];
      info['doi-publisher'] = api_result.message['publisher'];
      info['doi-type'] = api_result.message['type'];
      info['doi-ISSN'] = api_result.message['ISSN'];
      info['doi-subject'] = api_result.message['subject'];
    } else {
      // fill fields with empty values for csv purpose
      info['doi-publication-title'] = '';
      info['doi-publication-date-year'] = '';
      info['doi-publisher'] = '';
      info['doi-type'] = '';
      info['doi-ISSN'] = '';
      info['doi-subject'] = '';     
    }
    if (extended) {
      //console.log(api_result.message);
      // search licence informations
      if (api_result.message['license'] !== undefined
         && api_result.message['license'][0] !== undefined) {
        info['doi-license-content-version'] = api_result.message['license'][0]['content-version'];
        info['doi-license-URL'] = api_result.message['license'][0]['URL'];
      } else {
        console.error("No license informations");
        info['doi-license-content-version'] = '';
        info['doi-license-URL'] = '';
      }
    }

    return(info);
  }
  return({});
};


exports.DOIgetPublicationDateYear = function(doc) {
  var publication_date = doc.crossref_result.query_result.body.query.doi_record.crossref.journal.journal_article.publication_date;
  var publication_date_year;
  //console.log(publication_date);
  if (typeof publication_date === 'object') {
    if (typeof publication_date[0] === 'object') {
      publication_date_year = publication_date[0].year;
    } else if (publication_date.year === undefined) {
      publication_date_year = "unknown";
    } else {
      publication_date_year = publication_date.year;            
    }
  } else {
    publication_date_year = "unknown";
  }
  return(publication_date_year);
};
