/*change log

3-Octubre-2017: Se crea la función para registrar el shipping
18-Octubre-2017: Se crea la función para guardar tarjetas
20-Octubre-2017: Se crea la función para cargar a las tarjetas
27-Diciembre-2017: Se elimina conekta y se agrega t-pago
change log*/

var templates = require("./templates.js").templates;
var production = false;
var Mailgun = null;
//Production

if(production){
  // var domain = "viaservicios.com.mx";
  // Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-207406cb7f186389bdbf6c20b4c82ce7'});

  // var appId = "qJlZJ7Kjoxp4LSkiYzC2T34Mkea4ZMqHmavrcyQN";
  // var masterKey = "GDF6rB6TfdUzV14WjPTCpsC8bT4ki0lzf0KC4L0Q";
  // var javascriptKey = "IgkJ82CLUN4xIpiwD9UmFblPaUE650tRsw46Mbld";
}else{
  var domain = "sandbox0ac0a2a5c16246be98c97c0c2628f3fa.mailgun.org";
  Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-5e0f8c7de60172d4428cb1edbed23275'});
  // var conekta_key = 'Basic OmtleV81elE2NGZIcWhRZmYzSEthaUNWVDRn';
  var tPagoPublic = "lP2Gv2NrgpXkP25UiHCWxv4qHnK4mmoI:Fg4czj5lWgbUc9rJ0bX3IcPmSVgTKCUU";
  var tPagoPrivate = "lP2Gv2NrgpXkP25UiHCWxv4qHnK4mmoI:QOTBkZTHlz0SeNhLt6fDRJWGcloMEsI1";
  var appId = "OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1";
  var masterKey = "rZx1h8G9530G73xbzk5F1MLvGzb080KL2u55uC8S";
  var javascriptKey = "wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL";
}


/*SAVE CARD T-PAGO*/
Parse.Cloud.define("saveCard",function(request, response){

  var card = request.params;
  var user = request.user;
  var url = 'https://gateway.tevi.life/api/v1/vault/';
  var method = 'POST';
  var result;
  Parse.Cloud.httpRequest({
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': tPagoPublic
    },
    url: url,
    body: card
    }).then(function(httpResponse){
      result = httpResponse;
      if(result.text){
        result = JSON.parse(result.text);
        if(result.token){
          var Card = Parse.Object.extend('Card');
          var card = new Card();
          card.set('token',result.token);
          if(result.name)
            card.set('name',result.name);
          if(result.termination)
            card.set('termination',result.termination);
          if(result.brand)
            card.set('brand',result.brand);
          if(user)
            card.set('user',user);
          return card.save();
        }
      }
    }).then(function(){
      response.success(result);
    },function(result){
      response.error(result);
    });

});
/*SAVE CARD T-PAGO*/

Parse.Cloud.define("sendCotizacion",function(request, response){
  var params = request.params;
  var to =  "<carlos@paquete.mx>,<diego@paquete.mx>,<joe@paquete.mx>,<thalia@paquete.mx>";
  var subject =  "Cotización Solicitada";
  
  var fromZip = params.from.search;
  var fromCountry = params.from.country.name;
  if(fromCountry)
    fromCountry =  fromCountry.toUpperCase();
  var toZip = params.to.search;
  var toCountry = params.to.country.name;
  if(toCountry)
    toCountry =  toCountry.toUpperCase();
  var insurance ="";
  if(params.insurance && params.valueDeclared){
    insurance = "Valor Declarado: "+params.valueDeclared+"<br/>";
  }
  var packages = params.packages;
  var packagesList = "<br/>Paquetes: <br/>";
  if(params.type == 'envelope')
    packagesList = "<br/>Documentos: <br/>";
  packagesList += "------------------<br/>";
  for(var i=0; i< packages.length; i++){
    var width = packages[i].width;
    var length = packages[i].length;
    var weight = packages[i].weight;
    var height = packages[i].height;
    
    if(weight)
      packagesList += "Peso: "+weight+" Kg.<br/>";
    if(height)
      packagesList += "Alto: "+height+" cms.<br/>";
    if(length)
      packagesList += "Largo: "+length+"cms.<br/>";
    if(width)
      packagesList += "Ancho: "+width+" cms.<br/>";
    packagesList += "------------------<br/>";

  }
  var name = params.contact.name;
  if(name)
    name = name.toUpperCase();
  var lastname = params.contact.lastname;
  if(lastname)
    lastname = lastname.toUpperCase();
  var phone = params.contact.phone;
  var email = params.contact.email;
  if(email)
    email = email.toLowerCase();
  var contact = "Información de Contacto <br/><br/>";
  contact +="Nombre: "+name+"<br/>";
  contact +="Apellido: "+lastname+"<br/>";
  contact +="Telefono: "+phone+"<br/>";
  contact +="Correo Electrónico: "+email+"<br/>";

  var html = "<h2>Solicitud de Cotización</h2>País Origen: "+fromCountry+"<br/>Código Postal Origen: "+fromZip+"<br/>País Destino: "+toCountry+"<br/>Código Postal Destino: "+toZip+"<br/>"+packagesList+"<br/>"+insurance+"<br/>"+contact;
  sendEmail(to, subject, html, false, false).then(function(res){
    response.success(res);
  },function(err){
    response.error(err);
  });

})


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

  // var name = request.object.get('name');
  // var lastname = request.object.get('lastname');
  // var fullName = name+" "+lastname;
  // var email = request.object.get('username');
  // var mobile = request.object.get('mobile');
  // var body = {name:fullName,email:email};
  // var conektaId = null;
  // var url = 'https://api.conekta.io/customers';
  // conektaId = request.object.get('conektaId');
  // var method = "POST";

  // if(conektaId){
  //   url += "/"+conektaId;
  //   method =  "PUT";

  //   if(mobile && mobile.length == 10){
  //     body.phone = "+52"+mobile;
  //   }

  //   conektaUser(method,body,url).then(function(httpResponse){
  //     response.success();
  //   },function(error){
  //     response.error(error);
  //   });
  // }else{
    response.success();
  // }
});

Parse.Cloud.afterSave("_User", function(request){
  // var conektaId = null;
  // conektaId = request.object.get('conektaId');

  // if(!conektaId){
  //   var method = "POST";
  //   var name = request.object.get('name');
  //   var lastname = request.object.get('lastname');
  //   var fullName = name+" "+lastname;
  //   var email = request.object.get('username');
  //   var mobile = request.object.get('mobile');
  //   var body = {name:fullName,email:email,phone:mobile};


  //   conektaUser(method,body).then(function(httpResponse){
  //     if(httpResponse.text){
  //       conektaId = JSON.parse(httpResponse.text);
  //       console.log('conektaId');
  //       console.log(conektaId.id);
  //       if(conektaId && conektaId.id){
  //         conektaId =  conektaId.id;
  //         request.object.set('conektaId',conektaId);
  //         request.object.save(null,{useMasterKey:true});
  //       }
  //     }
  //   },function(error){
  //     request.object.errors = [];
  //     request.object.errors.push(error);
  //     resques.object.save();
  //   });
  // }
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
// var chargeCard = function(conektaId, cardId, amount, isToken){

//   var charge = {};
//   var customerInfo = {};

//   charge =  {
//               "payment_method": {
//                 "type": "card"
//               }
//             };

//   if(isToken){
//     charge.payment_method.token_id = cardId;
//   }else{
//     charge.payment_method.payment_source_id = cardId;
//   }

//   if(conektaId){
//     customerInfo.customer_id =  conektaId;
//   }

//     var referenceId = randomString(8);

//   var order = {
//     "currency": "MXN",
//     "metadata":{
//       "reference_id": referenceId
//     },
//     "customer_info" : customerInfo,
//     "line_items": [{
//       "name": "Servicio de envio" + referenceId,
//       "unit_price": amount,
//       "quantity": 1
//     }],
//     "charges": [
//       charge
//     ],
//     "shipping_lines":[
//       {
//         "amount"  : 10000,
//         "carrier" : 'fedex'
//       }
//     ],
//     "shipping_contact":{
//           "phone" : "5535068102",
//           "email": "carlos@canizal.com",
//           "receiver": "Carlos Canizal",
//           "address":{
//             "street1": "Rio Misisipi",
//             "city": "Iztapalapa",
//             "state": "Ciudad de Mexico",
//             "country": "Mexico",
//             "postal_code": "09770"
//           }
//         }
//   }

//   return order;
// }
//CONEKTA


//CREATES ORDER T-PAGO
var createOrder = function(cardId, amount){

  var referenceId = randomString(8);
  var order = {
    "order_id": referenceId,
    "token": cardId,
    "amount": amount,
    "detail": {}
  }
  return order;
}
//CREATES ORDER T-PAGO


//CHARGE CARD T-PAGO
var chargeCard = function(order, method){

  var parse_promise = new Parse.Promise();
  var url = "https://gateway.tevi.life/api/v1/transactions/auth/";

  if(!method)
    method = 'POST';

  Parse.Cloud.httpRequest({
  method: method,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': tPagoPrivate
  },
  url: url,
  body: order
  }).then(function(response){
    var result = JSON.parse(response.text);
    parse_promise.resolve(result);
  },function(httpResponse){
    var result= {error: true, message:null, result: httpResponse};
    if(httpResponse.text){
      
      var response = JSON.parse(httpResponse.text);
      result.result = response;
      if(response && response.details){
        if(response.details.length > 0 && response.details[0].message){
          result.message = response.details[0].message;
        }
      }
    }
    
    parse_promise.reject(result);
    
  });

  return parse_promise; 
}
//CHARGE CARD T-PAGO

//CONEKTA CREATE ORDER
// var conektaCreateOrder = function(order, method){

//   var parse_promise = new Parse.Promise();
//   var url = 'https://api.conekta.io/orders';

//   if(!method)
//     method = 'POST';

//   Parse.Cloud.httpRequest({
//   method: method,
//   headers: {
//     'Accept':'application/vnd.conekta-v2.0.0+json',
//     'Content-Type': 'application/json',
//     'Authorization': conekta_key
//   },
//   url: url,
//   body: order
//   }).then(function(response){
//     var result = JSON.parse(response.text);
//     parse_promise.resolve(result);
//   },function(httpResponse){
//     var result= {error: true, message:null, result: httpResponse};
//     if(httpResponse.text){
      
//       var response = JSON.parse(httpResponse.text);
//       result.result = response;
//       if(response && response.details){
//         if(response.details.length > 0 && response.details[0].message){
//           result.message = response.details[0].message;
//         }
//       }
//     }
    
//     parse_promise.reject(result);
    
//   });

//   return parse_promise; 
// }
//CONEKTA CREATE ORDER

/*SAVE CARD CONEKTA*/
// Parse.Cloud.define("saveCard", function(request, response){
//   var params = request.params;
//   var conektaId =  params.conektaId;
  
//   if(!conektaId){
//     var user = request.user;
//     conektaId = user.get('conektaId');
//   }

//   var token =  params.token;

//   var url = 'https://api.conekta.io/customers/'+conektaId+"/payment_sources";
//   var method = 'POST';
//   var result;
//   Parse.Cloud.httpRequest({
//     method: method,
//     headers: {
//       'Accept':'application/vnd.conekta-v2.0.0+json',
//       'Content-Type': 'application/json',
//       'Authorization': conekta_key
//     },
//     url: url,
//     body: {token_id:token, type:'card'}
//     }).then(function(httpResponse){
//       result = httpResponse;
//       response.success(result);
//     },function(result){
//       response.error(result);
//     });
// });
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

  var user = request.user;
  // var conektaId = request.params.conektaId;
  // if(!conektaId){
    // conektaId = user.get('conektaId');
  // }

  var paymentMethod = request.params.paymentMethod;
  var shipping = request.params.shipping;
  var amount = request.params.amount;
  // var amount = 50000;
  // var isToken = request.params.isToken
  var requestResult = {};
  var paymentSave;
  // isToken = isToken ==true;

  var cardId = paymentMethod.card.token;

  var order = createOrder(cardId, amount);
  chargeCard(order).then(function(result){
    requestResult.payment = result;
    var Payment = Parse.Object.extend('Payment');
    var payment = new Payment();

    //TODO Agregar el user cuando solo envian el conektaId
    payment.set('user',user);
    payment.set('charge',result);
    // if(result && result.charges && result.charges.data){
      // var charge = result.charges.data;
      // if(charge[0] && charge[0].payment_method){
        // payment.set('charge',charge[0].payment_method);
      // }
    // }

    if(result.message == "Aprobada" && result.auth_code){
      payment.set('status', result.message);
      payment.set('amount', result.amount);
      payment.set('brand', result.brand);
      payment.set('termination', result.termination);
      payment.set('reference', result.order_id);
      payment.set('authCode', result.auth_code);
      return payment.save();
    }else{
      var parse_promise = new Parse.Promise();
      parse_promise.reject(result);
      return parse_promise;
    }
  }).then(function(payment){
    // var status;
    paymentSave = payment;
    // if(requestResult.payment && requestResult.payment.payment_status)
      // status =  requestResult.payment.payment_status;

    // if(payment.message == "Aprobada"){
      // var paymentObject ={
        // paymentStatus : requestResult.payment.payment_status,
        // paymentAmount : (requestResult.payment.amount/100)
      // };
      return sendShipOrder(user, shipping,requestResult.payment);
    // }

  }).then(function(shipOrder){

    requestResult.shipOrder = shipOrder.params;
    /*agregar el shipOrder a payment*/
    // var Payment = Parse.Object.extend('Payment');
    // var payment = new Payment();
    
    paymentSave.set("order",shipOrder.shipping);
    paymentSave.set("trackingNumber",shipOrder.params.trackingNumber);

    return paymentSave.save();
    /*agregar el shipOrder a payment*/
  }).then(function(paymentSave){

    var fromAddress = shipping.from.street+" "+shipping.from.number;
    if(shipping.from.apt)
      fromAddress += " "+shipping.from.apt;
    fromAddress += "<br>";
    fromAddress += shipping.from.state+", "+shipping.from.city+", "+(shipping.from.country.code.toUpperCase())+"<br>"+shipping.from.zip+"<br>";

    var toAddress = shipping.to.street+" "+shipping.to.number;
    if(shipping.to.apt)
      toAddress += " "+shipping.to.apt;
    toAddress += "<br>";
    toAddress += shipping.to.state+", "+shipping.to.city+", "+(shipping.to.country.code.toUpperCase())+"<br>"+shipping.to.zip+"<br>";

    var trackingNumber = paymentSave.get("trackingNumber");
    var packages = '<table><thead><tr><th style="padding: 10px">#</th><th>Largo</th style="padding: 10px"><th style="padding: 10px">Ancho</th><th style="padding: 10px">Alto</th><th style="padding: 10px">Peso</th></tr></thead><tbody>';
    for(var i=0; i<shipping.packages.length; i++){
      packages += '<tr><td style="padding: 10px">'+(i+1)+'</td><td style="padding: 10px">'+shipping.packages[i].length+' cms</td><td style="padding: 10px">'+shipping.packages[i].width+' cms</td><td style="padding: 10px">'+shipping.packages[i].height+' cms</td><td style="padding: 10px">'+shipping.packages[i].weight+' Kg</td></tr>';
    }
    packages += "</tbody></table>";


    var html = templates.getOrderTemplate(fromAddress, toAddress, trackingNumber, (amount/100), packages, requestResult.shipOrder.carrier, shipping.service.name);
    //jccz send-email

    var file = "http://54.245.38.66/?trackingNumber="+trackingNumber; 
    return Parse.Cloud.httpRequest({
      method: 'GET',
      headers:{},
      url: file
    }).then(function(data){
      pdfBuffer = {data: data.buffer, filename: trackingNumber+".pdf"};
      var attch = [new Mailgun.Attachment(pdfBuffer)];
      return sendEmail(user.get('username'), "¡Gracias por usar Paquete.MX!", html, false, attch);
    });

  }).then(function(){
    
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
  console.log('payment-response0');
  console.log(payment);

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
      params = {
        carrier: body.type.toUpperCase(),
        // total : result.total,
        // negotiated : result.negotiated,
        trackingNumber: result.trackingNumber,
        packages: result.packages,
        status:'label_created',
        delivered: false,
        service: body.shipping
      }
    }

    if(payment){

      if(payment.amount)
        params.paymentAmount = payment.amount;
      if(payment.message)
        params.paymentStatus = payment.message;
      // if(payment && payment.charges && payment.charges.data){
        // var charge = payment.charges.data;
        // if(charge[0] && charge[0].payment_method){
      params.charge = payment;
        // }
      // }
    }


    return shipping.save(params);
  }).then(function(shipping){
    parse_promise.resolve({params:params, shipping:shipping});
  },function(err){
    parse_promise.reject(err);
  });

  return parse_promise;
};

var sendEmail = function(to, subject, html, bcc, attch){
  var parse_promise = new Parse.Promise();
  var params = { to: to,
                 from: "Paquete MX <hola@paquete.mx>",
                 subject: subject,
                 html: html
               };

  if(attch){
    params.attachment = attch;
  }

  if(bcc){
    params.bcc = 'jc.canizal@gmail.com';
  }

  Mailgun.messages().send(params,function(err, body) {
    if(err){
      parse_promise.reject(err);
    }else{
      parse_promise.resolve("Email sent!");
    }
  });
  return parse_promise;
}