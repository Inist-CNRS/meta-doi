/*global describe, it*/
'use strict';

var path    = require('path');
var should  = require('should');
var metaDOI = require('./index.js');
var testSet = [
  {
    "platform" : "ScienceDirect",
    "doi": "10.1016/0735-6757(91)90169-K",
    "year": "1991"
  },
  {
    "platform" : "Springer",
    "doi": "10.1007/BF02478894",
    "year": "1998"
  },
  {
    "platform" : "Wiley",
    "doi": "10.1111/issg.12022",
    "year": "2013"
  },
  {
    "platform" : "Wiley",
    "doi": "10.1111/j.1945-5100.1992.tb00734.x",
    "year": "1992"
  },
  {
    "platform" : "BMJ",
    "doi": "10.1136/bjsm.33.6.426",
    "year": "1999"
  }
];

describe('Crossref doi', function () {
  testSet.forEach(function(testCase) {
    //console.log(testCase.platform);
    DOIcheck(testCase);
    APIcheck(testCase);
  });
});

function DOIcheck(testCase) {
  //console.log(testCase);
  describe('DOI request ', function () {
      it('should be correctly enriched (@01) for ' + testCase.platform, function (done) {
        metaDOI.DOIquery(testCase.doi, function (err, doc) {
          if (err) {
            console.error(err);
            exit(1);
          }
          should.equal(metaDOI.DOIgetPublicationDateYear(doc), testCase.year);
          done();
        });
      });
  });
}

function APIcheck(testCase) {
  //console.log(testCase);
  describe('API request ', function () {
      //console.log(testCase);
      it('should be correctly enriched (@02) for ' + testCase.platform, function (done) {
        metaDOI.APIquery(testCase.doi, function (err, doc) {
          if (err) {
            console.error(err);
            exit(1);
          }
          console.log(metaDOI.APIgetPublicationTitle(doc));
          should.equal(metaDOI.APIgetPublicationDateYear(doc), testCase.year);
          done();
        });
      });
  });
}