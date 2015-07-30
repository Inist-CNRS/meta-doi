/*global describe, it*/
'use strict';

var path    = require('path');
var should  = require('should');
var crossref = require('./index.js');
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
    "year": "2015"
  },
  {
    "platform" : "Wiley",
    "doi": "10.1111/j.1945-5100.1992.tb00734.x",
    "year": "2015"
  },
  {
    "platform" : "BMJ",
    "doi": "10.1136/bjsm.33.6.426",
    "year": "1999"
  }
];

testSet.forEach(function(testCase) {
  console.log(testCase.platform);
  checkDOI(testCase);
});

function checkDOI(testCase) {
  console.log(testCase);
  describe('crossref doi', function () {
      console.log(testCase);
      it('should be correctly enriched (@01) with ' + testCase.platform, function (done) {
        console.log(testCase);

        crossref.DOIquery(testCase.doi, function (err, doc) {
          console.log("OOOO => ", testCase);
          if (err) {
            console.error(err);
            exit(1);
          }
          should.equal(doc.crossref_result.query_result.body.query.doi_record.crossref.journal.journal_article.publication_date.year, testCase.year);
          done();
        });
      });
  });
}