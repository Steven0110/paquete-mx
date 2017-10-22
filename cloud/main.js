/*change log

3-Octubre-2017: Se crea la función para registrar el shipping
18-Octubre-2017: Se crea la función para guardar tarjetas
20-Octubre-2017: Se crea la función para cargar a las tarjetas
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
  var conekta_key = 'Basic OmtleV81elE2NGZIcWhRZmYzSEthaUNWVDRn';
  var appId = "OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1";
  var masterKey = "rZx1h8G9530G73xbzk5F1MLvGzb080KL2u55uC8S";
  var javascriptKey = "wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL";
}


//DELETES CARD FROM CONEKTA
Parse.Cloud.define("removeCard",function(request, response){
  var user = request.user;
  var conektaId = user.get('conektaId');
  var cardId = request.params.cardId;
  var url = 'https://api.conekta.io/customers/'+conektaId+"/payment_sources/"+cardId;

  Parse.Cloud.httpRequest({
    method: "DELETE",
    headers: {
      'Accept':'application/vnd.conekta-v2.0.0+json',
      'Content-Type': 'application/json',
      'Authorization': conekta_key
    },
    url: url,
    success: function(httpResponse) {
      response.success(httpResponse);
    },
    error: function(httpResponse) {
      response.error(httpResponse);
    }
  });
});
//DELETES CARD FROM CONEKTA

//CREATES & UPDATES CONKETA USER WHEN PARSE USER IS UPDATED
Parse.Cloud.beforeSave("_User", function(request, response){
  // var clientId = request.object.get('clientId');

  var name = request.object.get('name');
  var lastname = request.object.get('lastname');
  var fullName = name+" "+lastname;
  var email = request.object.get('username');
  var mobile = request.object.get('mobile');
  var body = {name:fullName,email:email};
  var conektaId = null;
  var url = 'https://api.conekta.io/customers';
  conektaId = request.object.get('conektaId');
  var method = "POST";

  if(conektaId){
    url += "/"+conektaId;
    method =  "PUT";

    if(mobile && mobile.length == 10){
      body.phone = "+52"+mobile;
    }

    conektaUser(method,body,url).then(function(httpResponse){
      response.success();
    },function(error){
      response.error(error);
    });
  }else{
    response.success();
  }
});

Parse.Cloud.afterSave("_User", function(request){
  var conektaId = null;
  conektaId = request.object.get('conektaId');

  if(!conektaId){
    var method = "POST";
    var name = request.object.get('name');
    var lastname = request.object.get('lastname');
    var fullName = name+" "+lastname;
    var email = request.object.get('username');
    var mobile = request.object.get('mobile');
    var body = {name:fullName,email:email,phone:mobile};


    conektaUser(method,body).then(function(httpResponse){
      if(httpResponse.text){
        conektaId = JSON.parse(httpResponse.text);
        console.log('conektaId');
        console.log(conektaId.id);
        if(conektaId && conektaId.id){
          conektaId =  conektaId.id;
          request.object.set('conektaId',conektaId);
          request.object.save(null,{useMasterKey:true});
        }
      }
    },function(error){
      request.object.errors = [];
      request.object.errors.push(error);
      resques.object.save();
    });
  }
});



//CREATES & UPDATES CONKETA USER WHEN PARSE USER IS UPDATED

//CONEKTA REQUEST
function conektaUser(method,body, url){
  if(!url)
    url = 'https://api.conekta.io/customers';
  return Parse.Cloud.httpRequest({
    method: method,
    headers: {
      'Accept':'application/vnd.conekta-v2.0.0+json',
      'Content-Type': 'application/json',
      'Authorization': conekta_key
    },
    url: url,
    body: body
    });
}
//CONEKTA REQUEST


//CONEKTA 
var chargeCard = function(conektaId, cardId, amount, isToken){

  var charge = {};
  var customerInfo = {};

  charge =  {
              "payment_method": {
                "type": "card"
              }
            };

  if(isToken){
    charge.payment_method.token_id = cardId;
  }else{
    charge.payment_method.payment_source_id = cardId;
  }

  if(conektaId){
    customerInfo.customer_id =  conektaId;
  }

    var referenceId = randomString(8);

  var order = {
    "currency": "MXN",
    "metadata":{
      "reference_id": referenceId
    },
    "customer_info" : customerInfo,
    "line_items": [{
      "name": "Servicio de envio" + referenceId,
      "unit_price": amount,
      "quantity": 1
    }],
    "charges": [
      charge
    ],
    "shipping_lines":[
      {
        "amount"  : 10000,
        "carrier" : 'fedex'
      }
    ],
    "shipping_contact":{
          "phone" : "5535068102",
          "email": "carlos@canizal.com",
          "receiver": "Carlos Canizal",
          "address":{
            "street1": "Rio Misisipi",
            "city": "Iztapalapa",
            "state": "Ciudad de Mexico",
            "country": "Mexico",
            "postal_code": "09770"
          }
        }
  }

  return order;
}
//CONEKTA


//CONEKTA CREATE ORDER
var conektaCreateOrder = function(order, method){

  var parse_promise = new Parse.Promise();
  var url = 'https://api.conekta.io/orders';

  if(!method)
    method = 'POST';

  Parse.Cloud.httpRequest({
  method: method,
  headers: {
    'Accept':'application/vnd.conekta-v2.0.0+json',
    'Content-Type': 'application/json',
    'Authorization': conekta_key
  },
  url: url,
  body: order
  }).then(function(response){
    var result = JSON.parse(response.text);
    parse_promise.resolve(result);
  },function(httpResponse){
    parse_promise.reject(httpResponse);
  });

  return parse_promise; 
}
//CONEKTA CREATE ORDER

/*SAVE CARD CONEKTA*/
Parse.Cloud.define("saveCard", function(request, response){
  var params = request.params;
  var conektaId =  params.conektaId;
  
  if(!conektaId){
    var user = request.user;
    conektaId = user.get('conektaId');
  }

  var token =  params.token;

  var url = 'https://api.conekta.io/customers/'+conektaId+"/payment_sources";
  var method = 'POST';
  var result;
  Parse.Cloud.httpRequest({
    method: method,
    headers: {
      'Accept':'application/vnd.conekta-v2.0.0+json',
      'Content-Type': 'application/json',
      'Authorization': conekta_key
    },
    url: url,
    body: {token_id:token, type:'card'}
    }).then(function(httpResponse){
      result = httpResponse;
      response.success(result);
    },function(result){
      response.error(result);
    });
});
/*SAVE CARD CONEKTA*/

//GENERATES RANDOM STRING
function randomString(length)
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for( var i=0; i < length; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
//GENERATES RANDOM STRING

//CONEKTA CHARGE CARD
Parse.Cloud.define("chargeCard",function(request, response){

  var conektaId = request.params.conektaId;
  if(!conektaId){
    var user = request.user;
    conektaId = user.get('conektaId');
  }

  var paymentMethod = request.params.paymentMethod;
  var shipping = request.params.shipping;
  var amount = request.params.amount;
  var isToken = request.params.isToken
  var requestResult = {};
  isToken = isToken ==true;

  var cardId = paymentMethod.card.id;

  var order = chargeCard(conektaId, cardId, amount, isToken);
  conektaCreateOrder(order).then(function(result){
    requestResult.payment = result;
    var Payment = Parse.Object.extend('Payment');
    var payment = new Payment();

    //TODO Agregar el user cuando solo envian el conektaId
    payment.set('user',user);
    payment.set('response',result);

    if(result.payment_status){
      payment.set('status', result.payment_status);
      payment.set('amount', (result.amount/100));
    }
    return payment.save();
  }).then(function(payment){
    var status;
    if(requestResult.payment && requestResult.payment.payment_status)
      status =  requestResult.payment.payment_status;

    if(status == "paid"){
      var paymentObject ={
        paymentStatus : requestResult.payment.payment_status,
        paymentAmount : (requestResult.payment.amount/100)
      };
      return sendShipOrder(user, shipping,paymentObject);
    }

  }).then(function(shipOrder){
    requestResult.shipOrder = shipOrder
    response.success(requestResult);
  },function(error){
    response.error(error);
  });
  // response.success(order);
});
//CONEKTA CHARGE CARD

/*GET CUSTOMER CARDS IN CONEKTA*/
Parse.Cloud.define("getCustomer",function(request, response){
  var conektaId = request.params.conektaId;

  if(!conektaId){
    var user = request.user;
    conektaId = user.get('conektaId');
  }

  var url = 'https://api.conekta.io/customers/'+conektaId;

  Parse.Cloud.httpRequest({
    method: "GET",
    headers: {
      'Accept':'application/vnd.conekta-v2.0.0+json',
      'Content-Type': 'application/json',
      'Authorization': conekta_key
    },
    url: url,
    success: function(httpResponse) {
      response.success(httpResponse);
    },
    error: function(httpResponse) {
      console.error('Request failed with response code ' + httpResponse.status);
      response.error();
    }
  });
});
/*GET CUSTOMER CARDS IN CONEKTA*/


function sendShipOrder(user, shipping, payment) {
  var parse_promise = new Parse.Promise();

  var params ={};

  var body = {
    type      : shipping.service.service,
    shipping  : shipping
  }

  Parse.Cloud.httpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    url: 'https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/rate/ship',
    body: body
  }).then(function(result){
    console.log('result-shipping');
    console.log(result);
    var Shipping = Parse.Object.extend('Shipping');
    var shipping = new Shipping();
    shipping.set("user",user);

    if(result.text){
      result =  JSON.parse(result.text);
      console.log('result-json');
      console.log(result);
      params = {
        total : result.total,
        negotiated : result.negotiated,
        trackingNumber: result.trackingNumber,
        packages: result.packages
      }
    }

    if(payment){
      if(payment.paymentAmount)
        params.paymentAmount = payment.paymentAmount;
      if(payment.paymentStatus)
        params.paymentStatus = payment.paymentStatus;
    }


    return shipping.save(params);
  }).then(function(){
    parse_promise.resolve(params);
  },function(err){
    parse_promise.reject(err);
  });

  return parse_promise;
};