var AWS = require('aws-sdk');
var jsonQuery = require('json-query');


exports.handler = (event, context, callback) => {
  // Try S3
  var s3 = new AWS.S3({httpOptions: { timeout: 2000 }});
  var params = {
    Bucket: 'paquete-countries',
    Key: 'mx.json',
  };
//   var speechOutput= ""; 
  s3.getObject(params, function (err, data) {
    if (err) {
       console.log(err, err.stack);
    }
    else {
        var search = "09770";
        var country = "mx";
        console.log('canizal');
        // var data = require("https://s3-us-west-1.amazonaws.com/paquete-countries/mx.json");
        console.log('canizal1');

        var value = jsonQuery('[* zip~/^'+search+'/i | county~/^'+search+'/i]', {
            data: data,
            allowRegexp: true
        }).value;

        console.log(value);
        context.succeed(value);
    }


    speechOutput += " End. ";
    
    // var repromptText = "Help reprompt.";
    // response.ask(speechOutput, repromptText);
  });
}