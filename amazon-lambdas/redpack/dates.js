var https = require("http");
var convert = require('xml-to-json-promise');
var moment = require('moment');




var date1 = moment();
var date2 = moment("2017-12-14" );

differenceInMs = date2.diff(date1); // diff yields milliseconds
duration = moment.duration(differenceInMs); // moment.duration accepts ms
differenceInMinutes = duration.asMinutes();

var hours = Math.ceil(differenceInMinutes/60);

console.log(hours);