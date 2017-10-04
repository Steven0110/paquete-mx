/*change log

3-Octubre-2017: Se crea la función para registrar el shipping
change log*/



var production = false;

//Production

if(production){
  // var domain = "viaservicios.com.mx";
  // Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-207406cb7f186389bdbf6c20b4c82ce7'});

  // var appId = "qJlZJ7Kjoxp4LSkiYzC2T34Mkea4ZMqHmavrcyQN";
  // var masterKey = "GDF6rB6TfdUzV14WjPTCpsC8bT4ki0lzf0KC4L0Q";
  // var javascriptKey = "IgkJ82CLUN4xIpiwD9UmFblPaUE650tRsw46Mbld";
}else{
  var appId = "OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1";
  var masterKey = "rZx1h8G9530G73xbzk5F1MLvGzb080KL2u55uC8S";
  var javascriptKey = "wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL";
}

Parse.Cloud.define("Shipping", function(request, response) {
  
  if(!request.params.userId){
    response.error({message:"userId is required"});
  }

  if(!request.params.shipping){
    response.error({message:"shipping is required"});
  }

  var userId =  request.params.userId;
  var shipping =  request.params.shipping;

  var User = Parse.Object.extend('_User');
  var query = new Parse.Query(User);
  // query.equalTo({"objectId":userId});
  var user;
  var params ={};
  query.get(userId).then(function(user){
    user = user;

    Parse.Cloud.httpRequest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      url: 'https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/rate/ship',
      body: shipping
    }).then(function(result){
      var Shipping = Parse.Object.extend('Shipping');
      var shipping = new Shipping();
      shipping.set("user",user);

      if(result.text){
        result =  JSON.parse(result.text);

        params = {
          total : result.total,
          negotiated : result.negotiated,
          trackingNumber: result.trackingNumber,
          packages: result.packages
        }
      }

      return shipping.save(params);
    }).then(function(){
      response.success(params);
    },function(err){
      response.error(err);
    })


    // var Shipping = Parse.Object.extend('Shipping');
    // var shipping = new Shipping();
    // shipping.set("user",user);
    // var params = {
    //   total : request.params.total,
    //   negotiated : request.params.negotiated,
    //   trackingNumber: request.params.trackingNumber,
    //   packages: request.params.packages
    // };
    // return shipping.save(params);
    // response.success(user);
  },function(err){
    response.error(err);
  });

});