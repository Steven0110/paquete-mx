/*change log

3-Octubre-2017: Se crea la función para registrar el shipping
18-Octubre-2017: Se crea la función para guardar tarjetas
20-Octubre-2017: Se crea la función para cargar a las tarjetas
27-Diciembre-2017: Se elimina conekta y se agrega t-pago
6-Enero-2018: Se agregan las funciones de facturacion
9-Enero-2018: Se egrega procesamiento para cuenta enterprise
change log*/
var moment = require("./moment");
var templates = require("./templates.js").templates;
var production = true;
var Mailgun = null;

var emisor = {
              "cedula":{
                "RFC": null,
                "razonSocial":"CVG TRADING S.A. DE C.V.",
                "regimenFiscal":"601"
              },
              "CP":"15510"
            };
//Production

if(production){
  emisor.cedula.RFC = "MAG041126GT8";
  var domain = "paquete.mx";
  Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-5e0f8c7de60172d4428cb1edbed23275'});
  var tPagoPublic = "u2oiwgTFEHht04tqeYq0MT06Np8ixXdU:eEXLhTxBiYo6fmFnWupvaeN7lyxuEAot";
  var tPagoPrivate = "u2oiwgTFEHht04tqeYq0MT06Np8ixXdU:ylBRVVpuwDBbg0joIeyRwgQeY3U7KHNr";
  var appId = "OwwqTBzf9Tj618RyQqYmx3eJOhxaS8qolcojD3IA";
  var masterKey = "baplcn89UZ3uyJq0AflqtXjnFV2wRmo81SaWg7wd";
  var javascriptKey = "gCi0VgG0NVmtZA7lKsAAVVAvk9IwECg2GMJHwWdQ";

}else{
  emisor.cedula.RFC = "MAG041126GT8";
  //localhot
  // var domain = "sandbox0ac0a2a5c16246be98c97c0c2628f3fa.mailgun.org";
  //beta.paquete.mx
  var domain = 'beta.paquete.mx';
  //localhost
  // Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-5e0f8c7de60172d4428cb1edbed23275'});
  //beta.paquete.mx
  Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-5e0f8c7de60172d4428cb1edbed23275'});
  // var conekta_key = 'Basic OmtleV81elE2NGZIcWhRZmYzSEthaUNWVDRn';
  var tPagoPublic = "lP2Gv2NrgpXkP25UiHCWxv4qHnK4mmoI:Fg4czj5lWgbUc9rJ0bX3IcPmSVgTKCUU";
  var tPagoPrivate = "lP2Gv2NrgpXkP25UiHCWxv4qHnK4mmoI:QOTBkZTHlz0SeNhLt6fDRJWGcloMEsI1";
  var appId = "OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1";
  var masterKey = "rZx1h8G9530G73xbzk5F1MLvGzb080KL2u55uC8S";
  var javascriptKey = "wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL";
}


/*CREATE INVOICE*/

function createInvoice(user, amount, payment, shipping){
  var parse_promise = new Parse.Promise();

  getInvoceTotal('ingreso').then(function(folio){

    var RFC = "XAXX010101000";
    var razonSocial = "PÚBLICO EN GENERAL";
    var satResponse = false;

    if(user.get('invoice')){
      RFC =  user.get("taxId");
      if(!RFC)
        RFC = "XAXX010101000";

      razonSocial = user.get("taxName");
      if(!razonSocial)
        razonSocial = "PÚBLICO EN GENERAL";
    }

    var receptor = {
      'RFC'           : RFC,
      'razonSocial'   : razonSocial
    };

    var totalE = amount
    var valorUnitario = (amount/1.16).toFixed(2);

    var items = [{
                  "claveSAT":"78102200",
                  "claveLocal": "B20",
                  "cantidad": "1",
                  "claveUnidad": "E48",
                  "unidad":"Servicio",
                  "descripcion":"Servicio de paqueteria",
                  "valorUnitario": valorUnitario,
                  "totalE": totalE
                }];

    var metodoPago = "PUE";
    var serie =  "PQ";
    // var folio = "1";
    var newParams = {
                      'serie'     : serie,
                      'folio'     : folio,
                      'receptor'  : receptor,
                      'metodoPago': metodoPago,
                      'formaPago' : '04',
                      'items'     : items
                    };

    IngresoCFDI(newParams).then(function(params){
      return makeCFDI(params);
    }).then(function(res){

      if(res && res.cfdi){

        var satResponse =  res;
        var Invoice = Parse.Object.extend('Invoice');
        var invoice = new Invoice();

        if(res.cfdi.UUID){
          invoice.set("UUID",res.cfdi.UUID);
        }

        var paid = payment.get('paid');
        paid = paid ==true?true:false;
        var dueAmount = amount;
        if(paid)
          dueAmount = 0;

        invoice.set("cfdi",res.cfdi);
        invoice.set('amount', amount);
        invoice.set('paid', paid);
        invoice.set('dueAmount', dueAmount);
        invoice.set('cancelled', false);
        invoice.set('user', user);
        invoice.set('payment', payment);
        invoice.set('folio', res.cfdi.folio);
        invoice.set('serie', res.cfdi.serie);
        invoice.set('invoiceNo', res.cfdi.serie+res.cfdi.folio);

        if(shipping){
          invoice.set('shipping', shipping);
          invoice.set('trackingNumber', shipping.get("trackingNumber"));
        }
        if(user){
          var Account = Parse.Object.extend('Account');
          var account = new Account();
          account.id = user.get('account').id;
          if(account.id)
            invoice.set("account",account);
        }
        return invoice.save();
      }else{
        var parse_promise2 = new Parse.Promise();
        parse_promise2.reject();
        return parse_promise2;
      }

    }).then(function(){
      console.log('done!')
      parse_promise.resolve(satResponse);
    },function(err){
      parse_promise.reject(err);
    });
  },function(err){
    parse_promise.reject(err);
  });

  return parse_promise;
}

function getInvoceTotal(type){
  var parse_promise = new Parse.Promise();
  var InvoiceTotal = new Parse.Object.extend("InvoiceTotal");
  var query = new Parse.Query(InvoiceTotal);
  var index;
  query.first().then(function(totals){
    console.log('totals');
    console.log(totals);
    if(totals){
      index = totals.get(type);
      totals.set(type,index+1);
      return totals.save();
    }
  }).then(function(){
    parse_promise.resolve(index.toString());
  },function(err){
    parse_promise.reject(err);
  });

  return parse_promise;
}

/*CREATE INVOICE*/

Parse.Cloud.define("setPassword",function(request, response){

  var recoveryKey = request.params.recoveryKey;
  var password = request.params.password;

  var User = Parse.Object.extend('_User');
  var query = new Parse.Query(User);
  query.equalTo('recoveryKey', recoveryKey);
  query.first().then(function(user){
    if(user && password){
      user.set('recoveryKey',"");
      user.set('password',password);
      user.save(null,{useMasterKey:true}).then(function(){
        response.success();
      },function(err){
        response.error(err);
      })
    }else{
      response.error({message: 'Invalid Password'});
    }
  },function(err){
    response.error(err);
  })
})

Parse.Cloud.define("cancelPickup",function(request, response){
  var params = request.params;
  var body ={};

  if(params.trackingNumber){
    body.trackingNumber = params.trackingNumber;
  }

  if(params.carrier)
    body.type = params.carrier.toLowerCase();

  var Shipping = Parse.Object.extend('Shipping');
  var query = new Parse.Query(Shipping);
  query.equalTo('trackingNumber',params.trackingNumber);
  query.first().then(function(res){

    if(res){
      shipping =  res;

      var pickupConfirmation = shipping.get("pickupConfirmation");
      if(pickupConfirmation)
        body.pickupConfirmation = pickupConfirmation

      console.log(body);

      Parse.Cloud.httpRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        url: 'https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api/cancelpickup',
        body: body
      }).then(function(res){
        console.log('heeeeee');
        console.log(res.text);
        if(res.text){
          res =  JSON.parse(res.text);
          console.log(res);
          if(res.confirmation){
            shipping.set('pickupConfirmation', null);
            shipping.save().then(function(){
              response.success(res);
            });
          }
        }else{
          response.error({error:true, message:"Imposible cancelar recolección, intenta de nuevo por favor."});
        }
      },function(err){
        if(err && err.data && err.data.error){
          err = err.data.error;
        }
        response.error(err);
      });
    }else{
      response.error({error:true, message:"Invalid trackingNumber"});
    }
  },function(err){
    response.error(err);
  })
});


Parse.Cloud.define("sendPickUp",function(request, response){
  var params = request.params;
  var body ={
  }

  if(params.carrier)
    body.type = params.carrier.toLowerCase();

  if(params.date)
    body.date = moment(params.date).format("YYYY-MM-DD");

  if(params.schedule){
    var schedule = params.schedule.split("-");
    if(schedule[0])
      body.start = schedule[0];
    if(schedule[1])
      body.end = schedule[1];
  }

  if(params.trackingNumber)
    body.trackingNumber = params.trackingNumber;

  var Shipping = Parse.Object.extend('Shipping');
  var query = new Parse.Query(Shipping);
  query.equalTo('trackingNumber',params.trackingNumber);
  query.first().then(function(res){

    if(res){
      shipping =  res;

      var service = shipping.get("service");
      if(service){
        if(service.packages)
          body.packages = service.packages;

        if(service.from){
          body.from = service.from;
        }

        if(service.to){
          body.to = service.to;
        }

        if(service.service && service.service.code)
          body.serviceCode = service.service.code;
        }

      console.log(body);

      Parse.Cloud.httpRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        url: 'https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api/pickup',
        body: body
      }).then(function(res){
        if(res.text){
          res =  JSON.parse(res.text);
          if(res.confirmation){
            shipping.set('pickupConfirmation',res.confirmation);
            shipping.save().then(function(){
              response.success(res);
            })
          }
        }else{
          response.error({error:true, message:"Imposible agendar recolección, intenta de nuevo por favor."});
        }
      },function(err){
        if(err && err.data && err.data.error){
          err = err.data.error;
        }
        response.error(err);
      });
    }else{
      response.error({error:true, message:"Invalid trackingNumber"});
    }
  },function(err){
    response.error(err);
  })
});

Parse.Cloud.define("validateKey",function(request, response){
  var recoveryKey = request.params.key;
  if(!recoveryKey){
    response.error({message: "Invalid Key"});
  }

  var User = Parse.Object.extend('_User');
  var query = new Parse.Query(User);
  query.equalTo('recoveryKey', recoveryKey);

  query.first().then(function(user){
    if(user){
      response.success();
    }else{
      response.error();
    }
  },function(err){
    response.error();
  });

});


Parse.Cloud.define("recoveryPassword",function(request, response){
  var email = request.params.email;

  if(!email){
    response.error({message: "Invalid Email"});
  }

  var User = Parse.Object.extend('_User');
  var query = new Parse.Query(User);
  query.equalTo('username', email);
  query.first().then(function(user){
    if(user){
      var key = randomStringLower(15);
      user.set('recoveryKey',key);
      user.save(null,{useMasterKey:true}).then(function(user){

        var html = templates.recoveryTemplate(key);
        html = htmlTemplate(html);
        return sendEmail(email, "¡Recuperar Contraseña Paquete.MX!", html, false);
      }).then(function(){
        response.success({recovery:true});
      },function(err){
        response.error(err);
      })
    }else{
      response.error({registered: false,message: "Correo Electrónico no registrado."});
    }
  },function(err){
    response.error(err);
  })
  // response.success({email:email});
});


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


Parse.Cloud.beforeSave("Account", function(request, response){
  var type = request.object.get('type');
  if(request.object.existed() === false){
    var accountNo = randomString(7);
    request.object.set('verified',false);
    request.object.set('accountNo', accountNo);
    request.object.set('actaConstitutiva',"false");
    request.object.set('INE',"false");
    request.object.set('comprobanteDomicilio',"false");
    request.object.set('constanciaFiscal',"false");
    request.object.set('caratulaBancaria',"false");
    request.object.set('autorizacionBuro',"false");
    request.object.set('status',"submitDocs");

    var name;
    if(type && type == 'enterprise'){
      name = request.object.get('companyName');
      name = name.toUpperCase();
    }
    else if(type && type == 'personal'){
      if(request.object.get('taxName')){
        name =  request.object.get('taxName');
        name = name.trim();
        name = name.toUpperCase();
      }
      else if(request.object.get('name')){
        name =  request.object.get('name');
        name = name.trim();
        name = name.toUpperCase();
      }
      else{
        name = accountNo;
      }
    }
    request.object.set('name', name);
  }

  var taxId =  request.object.get('taxId');
  if(taxId){
    taxId =  taxId.trim();
    taxId = taxId.toUpperCase();
    request.object.set('taxId', taxId);
  }

  var taxName =  request.object.get('taxName');
  if(taxName){
    taxName =  taxName.trim();
    taxName = taxName.toUpperCase();
    request.object.set('taxName', taxName);
  }

  var companyName =  request.object.get('companyName');
  if(companyName){
    companyName =  companyName.trim();
    companyName = companyName.toUpperCase();
    request.object.set('companyName', companyName);
  }


  /*documentos*/
  if(type == 'enterprise' && !request.object.get('verified')){
    console.log('ready to beApproved 0');
    var INE = request.object.get('INE');
    var comprobanteDomicilio = request.object.get('comprobanteDomicilio');
    var constanciaFiscal = request.object.get('constanciaFiscal');
    var caratulaBancaria =  request.object.get('caratulaBancaria');
    var autorizacionBuro =  request.object.get('autorizacionBuro');

    console.log('ready to beApproved');
    if(INE != "false" && comprobanteDomicilio != "false" && constanciaFiscal != "false" && caratulaBancaria != "false" && autorizacionBuro != "false"){
      request.object.set('status','waitingApproval');
    }

  }
  /*documentos*/

  response.success();

});

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

function sendInvoice(cfdi, type, dataInfo, email, trackingNumber, name){
  console.log('send-email-3.2');
  if(!cfdi || !cfdi.UUID){
    // return false;
    var parse_promise = new Parse.Promise();
    parse_promise.reject(false);
    return parse_promise;
    //regresar promsesa
  }

  var file = "https://s3-us-west-2.amazonaws.com/paquetemx/invoices/"+cfdi.UUID; 
  var pdfPath = file+".pdf";
  var xmlPath = file+".xml";
  var pdfBuffer;
  var xmlBuffer;
  return Parse.Cloud.httpRequest({
    method: 'GET',
    headers:{},
    url: pdfPath
  }).then(function(data){
    pdfBuffer = {data: data.buffer, filename: "factura.pdf"};
    return Parse.Cloud.httpRequest({
      method: 'GET',
      headers:{},
      url: xmlPath
    });
  }).then(function(data){
    console.log('send-email-3.3');
    xmlBuffer = {data: data.buffer, filename: "factura.xml"};
    var attch = [new Mailgun.Attachment(pdfBuffer), new Mailgun.Attachment(xmlBuffer)];
    var html = htmlTemplate(templates.newInvoice(type,name, dataInfo, trackingNumber));

    console.log('send-email-3.4');
    var subject = "¡Se ha generado una nueva factura!";
    if(dataInfo.invoiceNo){
      if(type ==  'pago')
        subject = 'Complemento de Pago';
      else
        subject = '¡Tu factura '+dataInfo.invoiceNo+' está lista para descargarse!';
    }

    return sendEmail(email, subject, html, true, attch);
  });
}

Parse.Cloud.afterSave("Invoice",function(request){
  if(request.object.existed() === false){
    var cfdi = request.object.get("cfdi");
    console.log(cfdi.UUID);
    var data = {};
    var account;
    var user;
    var trackingNumber;
    request.object.get("account").fetch().then(function(res){
      account = res;
      return request.object.get("user").fetch();
    }).then(function(res){
      user = res;
      if(account && account.get('taxName'))
        data.razonSocial = account.get('taxName');
      if(request.object.get('invoiceNo'))
        data.invoiceNo = request.object.get('invoiceNo');

      if(request.object.get('trackingNumber'))
        trackingNumber = request.object.get('trackingNumber'); 

      var email = false;
      if(user.get('username'))
        email = user.get('username');

      var name = false;
      if(user.get('name'))
        name = user.get('name');

      if(email && account.get("invoice")){
        return sendInvoice(cfdi,"ingreso", data, email, trackingNumber, name);
      }
    },function(err){
      console.log(err);
    });
  }
});


Parse.Cloud.afterSave("_User", function(request){
  var user = request.object;
  if(!user.get('verifyKey')){
    console.log('inside-user-save');
    if(user.get('accountType') == 'personal'){
      // pdfBuffer = {data: data.buffer, filename: trackingNumber+".pdf"};
      var name =  user.get('name');
      var html = templates.personalWelcome(name);
      html = htmlTemplate(html);
      // var attch = [new Mailgun.Attachment(pdfBuffer)];
      sendEmail(user.get('username'), "¡Bienvenido a PAQUETE.MX!", html, false, false).then(function(){
        var verifyKey = randomString(15);
        user.set("verifyKey", verifyKey);
        user.save(null,{useMasterKey:true});
      });
    }
    else if(user.get('accountType') == 'enterprise'){

      var file = "https://s3-us-west-2.amazonaws.com/paquetemx/general/autorizacion_buro.pdf";
      return Parse.Cloud.httpRequest({
        method: 'GET',
        headers:{},
        url: file
      }).then(function(data){
        pdfBuffer = {data: data.buffer, filename: "autorizacion_buro.pdf"};
        var name =  user.get('name');
        var html = templates.enterpriseWelcome(name);
        html = htmlTemplate(html);
        var attch = [new Mailgun.Attachment(pdfBuffer)];
        sendEmail(user.get('username'), "¡Bienvenido a PAQUETE.MX!", html, false, attch).then(function(){
          var verifyKey = randomString(15);
          user.set("verifyKey", verifyKey);
          user.save(null,{useMasterKey:true});
        });
      });
    }

    // var verifyKey = randomString(15);
    // user.set("verifyKey", verifyKey);
    // user.save(null,{useMasterKey:true});

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


var submitOrder = function(type, order, user){
  if(type == 'card' && order){
    return chargeCard(order);
  }else if(type=='account'){
    var parse_promise = new Parse.Promise();
    user.get('account').fetch().then(function(account){
      if(account && account.get('type') == 'enterprise'){
        if(account.get('verified') == true){
          var amount = parseFloat(order.amount);
          if(amount && amount > 0){

            var available = account.get('creditAvailable');
            var status = account.get('status');
            var verified = account.get('verified');
            var limit = account.get('creditLimit');

            if(verified && status == 'active' && available > amount){
              var auth = randomString(8);
              var params = {
                message : 'Aprobada',
                brand   : 'PQT',
                termination : '0000',
                reference   : auth,
                auth_code   : auth,
                amount      : amount,
                order_id    : auth,
                type        : type
              }

              var newBalance = (available - amount).toFixed(2)
              newBalance = parseFloat(newBalance);
              account.set('creditAvailable', newBalance);
              account.save().then(function(){
                var EnterpriseLog = Parse.Object.extend('EnterpriseLog');
                var enterpriseLog = new EnterpriseLog();

                enterpriseLog.set('limit', limit);
                enterpriseLog.set('available', available);
                enterpriseLog.set('newBalance', newBalance);
                enterpriseLog.set('account', account);
                enterpriseLog.set('amount', amount);
                enterpriseLog.set('user', user);
                return enterpriseLog.save();
              }).then(function(){
                parse_promise.resolve(params);
              },function(err){
                parse_promise.reject(err);
              });

            }else{
              parse_promise.reject({message:"Se ha alcanzado el limite de crédito de la cuenta. Contactanos en hola@paquete.mx"});
            }
          }else{
            parse_promise.reject({message:"Invalid amount, must be greather than 0"});
          }
        }else{
          parse_promise.reject({message:"Invalid Account, need to verify"});
        }
      }else{
        parse_promise.reject({message:"Invalid Account Privileges"});
      }
    },function(err){
      parse_promise.reject(err);
    });
    return parse_promise;
  }else{
    var parse_promise = new Parse.Promise();
    parse_promise.reject({message:"Invalid account Type"});
    return parse_promise
  }
}

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

function randomStringLower(length)
{
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for( var i=0; i < length; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
//GENERATES RANDOM STRING

//CONEKTA CHARGE CARD
Parse.Cloud.define("chargeCard",function(request, response){

  var user = request.user;

  var paymentMethod = request.params.paymentMethod;
  var shipping = request.params.shipping;
  var amount = request.params.amount.toFixed(2);
  amount = parseFloat(amount);
  // var amount = 50000;
  // var isToken = request.params.isToken
  var requestResult = {};
  var paymentSave;
  // isToken = isToken ==true;
  var order =  {amount: amount};
  var paymentType = false;
  var paid = false;

  if(paymentMethod && paymentMethod.card){
    var cardId = paymentMethod.card.token;
    order = createOrder(cardId, amount);
    paymentType = 'card';
  }else if(paymentMethod == 'account'){
    paymentType = 'account';
  }

  submitOrder(paymentType ,order, user).then(function(result){
    requestResult.payment = result;

    if((result.message == "Aprobada" || result.message == "Approved") && result.auth_code){
      var Payment = Parse.Object.extend('Payment');
      var payment = new Payment();
      payment.set('user',user);
      payment.set('charge',result);
      payment.set('status', result.message);
      payment.set('amount', result.amount);
      payment.set('brand', result.brand);
      payment.set('termination', result.termination);
      payment.set('reference', result.order_id);
      payment.set('authCode', result.auth_code);
      payment.set('type', paymentType);

      if(user){
        var Account = Parse.Object.extend('Account');
        var account = new Account();
        account.id = user.get('account').id;
        if(account.id)
          payment.set("account",account);
      }

      if(paymentType == 'account'){
        payment.set('paid', false);
        paid = false;
      }
      else if(paymentType == 'card'){
        payment.set('paid', true);
        paid = true;
      }
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
    requestResult.shipping = shipOrder.shipping;
    requestResult.shipOrder = shipOrder.params;
    /*agregar el shipOrder a payment*/
    // var Payment = Parse.Object.extend('Payment');
    // var payment = new Payment();
    
    paymentSave.set("order",shipOrder.shipping);
    paymentSave.set("trackingNumber",shipOrder.params.trackingNumber);

    return paymentSave.save();
    /*agregar el shipOrder a payment*/
  }).then(function(paymentSave){

    paymentSave = paymentSave;

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


    
    //jccz send-email

    var file = "http://54.245.38.66/?trackingNumber="+trackingNumber; 
    return Parse.Cloud.httpRequest({
      method: 'GET',
      headers:{},
      url: file
    }).then(function(data){
      pdfBuffer = {data: data.buffer, filename: trackingNumber+".pdf"};
      var html = templates.getOrderTemplate(fromAddress, toAddress, trackingNumber,amount, packages, requestResult.shipOrder.carrier, shipping.service.name);
      html = htmlTemplate(html);
      var attch = [new Mailgun.Attachment(pdfBuffer)];
      return sendEmail(user.get('username'), "¡Gracias por usar Paquete.MX!", html, false, attch);
    });

  }).then(function(){
    createInvoice(user, amount, paymentSave, requestResult.shipping);
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

/*CREACION DE LA FACTURA FISCAL*/
function makeCFDI(params){
  var parse_promise = new Parse.Promise();

  var url = 'http://54.244.218.15/development/index.php';

  if(production){
    url = 'http://54.244.218.15/endpoint/index.php';
  }


  
  var method = 'POST';

  Parse.Cloud.httpRequest({
  method: method,
  headers: {
    'Content-Type': 'application/json'
  },
  url: url,
  body: params
  }).then(function(response){
    console.log("****** RESPONSE SAT OFICIAL 03 ******");
    console.log(response.text);
    console.log(params);
    if(response && response.text){
      if(response.text.error){
        console.log("****** ERROR SAT OFICIAL ******");
        console.log(response.text);
        parse_promise.reject(response.text.error);
      }else{
        var result = JSON.parse(response.text);
        parse_promise.resolve(result);
      }
    }else{
      parse_promise.reject(response);
    }
  },function(err){
    console.log('error');
    console.log(err);
    console.log('error-canizal');
    // if(err.text)
      // err = JSON.parse(err.text);
    parse_promise.reject(err);
  });

  return parse_promise;
}
/*CREACION DE LA FACTURA FISCAL*/

/*Generar objecto de ingreso para facturacion*/
function IngresoCFDI(params){
  var parse_promise = new Parse.Promise();
  if(!params.serie)
    parse_promise.reject({error:true,message:'serie is required'});
  else if(!params.folio)
    parse_promise.reject({error:true,message:'folio is required'});
  else if(!params.receptor)
    parse_promise.reject({error:true,message:'receptor is required'});
  else if(!params.items)
    parse_promise.reject({error:true,message:'items are required'});
  else if(!params.metodoPago)
    parse_promise.reject({error:true,message:'metodoPago is required'});
  else if(!params.formaPago)
    parse_promise.reject({error:true,message:'formaPago is required'});
  else{

    var lugarExpedicion = emisor.CP;
    if(params.serviceZip){
      lugarExpedicion = params.serviceZip;
    }

    var cfdi = {  
              "serie": params.serie,
              "folio": params.folio,
              "formaPago": params.formaPago,
              "metodoPago": params.metodoPago,
              "lugarExpedicion": lugarExpedicion,
              "tipoDeComprobante":"I",
              "usoCFDI":"G03",
              "trasladados":{
                "iva":{
                  "tasa":"0.160000",
                  "factor":"Tasa",
                  "impuesto":"002"
                }
              },
              "receptor": params.receptor,
              "emisor": emisor.cedula,
              "items": params.items
            };

    if(params.relacionados){
      cfdi.relacionados = params.relacionados;
    }
    
    parse_promise.resolve(cfdi);
  }
  return parse_promise;
}
/*Generar objecto de ingreso para facturacion*/


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
    url: 'https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api/ship',
    body: body
  }).then(function(result){
    console.log('result-shipping');
    console.log(result.text);
    var Shipping = Parse.Object.extend('Shipping');
    var shipping = new Shipping();

    var Account = Parse.Object.extend('Account');
    var account = new Account();

    account.id = user.get('account').id;
    if(account.id)
      shipping.set("account",account);

    if(payment.type){
      shipping.set("paymentType",payment.type);

      if(payment.type == 'card'){
        shipping.set("paid", true);
      }else if(payment.type == 'account'){
        shipping.set("paid", false);
      }
    }

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


var loopItems = function(skip, limit, element, startDate, endDate, result){
  var Element = Parse.Object.extend(element);
  var query = new Parse.Query(Element);
  query.skip(skip);
  query.limit(limit);
  query.greaterThanOrEqualTo('createdAt',startDate);
  query.lessThanOrEqualTo('createdAt',endDate);
  var deferred = new Parse.Promise();
  query.find().then(function(items){

    console.log(items.length);
    if(items && items.length > 0){
      skip += limit;

      asyncEach(items, function(item, i, next){
        

        
      },function(){
        console.log('all items in batch');
        loopItems(skip, limit,element, startDate, endDate, result).then(function(res){
          deferred.resolve(result);
        });
      })
    }else{
      deferred.resolve('done');
      console.log(result);
    }
  });

  return deferred;
}

/*email*/
function htmlTemplate(text){
  return '<!doctype html> <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <!-- NAME: 1 COLUMN --> <!--[if gte mso 15]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--> <meta charset="UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title>*|MC:SUBJECT|*</title> <style type="text/css"> p{ margin:10px 0; padding:0; } table{ border-collapse:collapse; } h1,h2,h3,h4,h5,h6{ display:block; margin:0; padding:0; } img,a img{ border:0; height:auto; outline:none; text-decoration:none; } body,#bodyTable,#bodyCell{ height:100%; margin:0; padding:0; width:100%; } #outlook a{ padding:0; } img{ -ms-interpolation-mode:bicubic; } table{ mso-table-lspace:0pt; mso-table-rspace:0pt; } .ReadMsgBody{ width:100%; } .ExternalClass{ width:100%; } p,a,li,td,blockquote{ mso-line-height-rule:exactly; } a[href^=tel],a[href^=sms]{ color:inherit; cursor:default; text-decoration:none; } p,a,li,td,body,table,blockquote{ -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; } .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{ line-height:100%; } a[x-apple-data-detectors]{ color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; } #bodyCell{ padding:10px; } .templateContainer{ max-width:600px !important; } a.mcnButton{ display:block; } .mcnImage{ vertical-align:bottom; } .mcnTextContent{ word-break:break-word; } .mcnTextContent img{ height:auto !important; } .mcnDividerBlock{ table-layout:fixed !important; } body,#bodyTable{ background-color:#FAFAFA; } #bodyCell{ border-top:0; } .templateContainer{ border:0; } h1{ color:#202020; font-family:Helvetica; font-size:26px; font-style:normal; font-weight:bold; line-height:125%; letter-spacing:normal; text-align:left; } h2{ color:#202020; font-family:Helvetica; font-size:22px; font-style:normal; font-weight:bold; line-height:125%; letter-spacing:normal; text-align:left; } h3{ color:#202020; font-family:Helvetica; font-size:20px; font-style:normal; font-weight:bold; line-height:125%; letter-spacing:normal; text-align:left; } h4{ color:#202020; font-family:Helvetica; font-size:18px; font-style:normal; font-weight:bold; line-height:125%; letter-spacing:normal; text-align:left; } #templatePreheader{ background-color:#FAFAFA; border-top:0; border-bottom:0; padding-top:9px; padding-bottom:9px; } #templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{ color:#656565; font-family:Helvetica; font-size:12px; line-height:150%; text-align:left; } #templatePreheader .mcnTextContent a,#templatePreheader .mcnTextContent p a{ color:#656565; font-weight:normal; text-decoration:underline; } #templateHeader{ background-color:#FFFFFF; border-top:0; border-bottom:0; padding-top:9px; padding-bottom:0; } #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{ color:#202020; font-family:Helvetica; font-size:16px; line-height:150%; text-align:left; } #templateHeader .mcnTextContent a,#templateHeader .mcnTextContent p a{ color:#2BAADF; font-weight:normal; text-decoration:underline; } #templateBody{ background-color:#FFFFFF; border-top:0; border-bottom:2px solid #EAEAEA; padding-top:0; padding-bottom:9px; } #templateBody .mcnTextContent,#templateBody .mcnTextContent p{ color:#202020; font-family:Helvetica; font-size:16px; line-height:150%; text-align:left; } #templateBody .mcnTextContent a,#templateBody .mcnTextContent p a{ color:#2BAADF; font-weight:normal; text-decoration:underline; } #templateFooter{ background-color:#FAFAFA; border-top:0; border-bottom:0; padding-top:9px; padding-bottom:9px; } #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{ color:#656565; font-family:Helvetica; font-size:12px; line-height:150%; text-align:center; } #templateFooter .mcnTextContent a,#templateFooter .mcnTextContent p a{ color:#656565; font-weight:normal; text-decoration:underline; } @media only screen and (min-width:768px){ .templateContainer{ width:600px !important; } } @media only screen and (max-width: 480px){ body,table,td,p,a,li,blockquote{ -webkit-text-size-adjust:none !important; } } @media only screen and (max-width: 480px){ body{ width:100% !important; min-width:100% !important; } } @media only screen and (max-width: 480px){ #bodyCell{ padding-top:10px !important; } } @media only screen and (max-width: 480px){ .mcnImage{ width:100% !important; } } @media only screen and (max-width: 480px){ .mcnCaptionTopContent,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer{ max-width:100% !important; width:100% !important; } } @media only screen and (max-width: 480px){ .mcnBoxedTextContentContainer{ min-width:100% !important; } } @media only screen and (max-width: 480px){ .mcnImageGroupContent{ padding:9px !important; } } @media only screen and (max-width: 480px){ .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{ padding-top:9px !important; } } @media only screen and (max-width: 480px){ .mcnImageCardTopImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{ padding-top:18px !important; } } @media only screen and (max-width: 480px){ .mcnImageCardBottomImageContent{ padding-bottom:9px !important; } } @media only screen and (max-width: 480px){ .mcnImageGroupBlockInner{ padding-top:0 !important; padding-bottom:0 !important; } } @media only screen and (max-width: 480px){ .mcnImageGroupBlockOuter{ padding-top:9px !important; padding-bottom:9px !important; } } @media only screen and (max-width: 480px){ .mcnTextContent,.mcnBoxedTextContentColumn{ padding-right:18px !important; padding-left:18px !important; } } @media only screen and (max-width: 480px){ .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{ padding-right:18px !important; padding-bottom:0 !important; padding-left:18px !important; } } @media only screen and (max-width: 480px){ .mcpreview-image-uploader{ display:none !important; width:100% !important; } } @media only screen and (max-width: 480px){ h1{ font-size:22px !important; line-height:125% !important; } } @media only screen and (max-width: 480px){ h2{ font-size:20px !important; line-height:125% !important; } } @media only screen and (max-width: 480px){ h3{ font-size:18px !important; line-height:125% !important; } } @media only screen and (max-width: 480px){ h4{ font-size:16px !important; line-height:150% !important; } } @media only screen and (max-width: 480px){ .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{ font-size:14px !important; line-height:150% !important; } } @media only screen and (max-width: 480px){ #templatePreheader{ display:block !important; } } @media only screen and (max-width: 480px){ #templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{ font-size:14px !important; line-height:150% !important; } } @media only screen and (max-width: 480px){ #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{ font-size:16px !important; line-height:150% !important; } } @media only screen and (max-width: 480px){ #templateBody .mcnTextContent,#templateBody .mcnTextContent p{ font-size:16px !important; line-height:150% !important; } } @media only screen and (max-width: 480px){ #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{ font-size:14px !important; line-height:150% !important; } }</style> </head> <body> <center> <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable"> <tr> <td align="center" valign="top" id="bodyCell"> <!-- BEGIN TEMPLATE // --> <!--[if gte mso 9]> <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;"> <tr> <td align="center" valign="top" width="600" style="width:600px;"> <![endif]--> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer"> <tr> <td valign="top" id="templatePreheader"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;"> </table></td> </tr> <tr> <td valign="top" id="templateHeader"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%; background-color: #f38b00"> <tbody class="mcnImageBlockOuter"> <tr> <td valign="top" style="padding:9px" class="mcnImageBlockInner"> <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;"> <tbody><tr> <td class="mcnImageContent" valign="top" style="padding-right: 9px; padding-left: 9px; padding-top: 0; padding-bottom: 0; text-align:center;"> <img align="center" alt="" src="https://s3-us-west-2.amazonaws.com/paquetemx/general/logo-blanco.png" width="200" style="max-width:200px; padding-bottom: 0; display: inline !important; vertical-align: bottom;" class="mcnImage"> </td> </tr> </tbody></table> </td> </tr> </tbody> </table></td> </tr> <tr> <td valign="top" id="templateBody"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;"> <tbody class="mcnTextBlockOuter"> <tr> <td valign="top" class="mcnTextBlockInner"> <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnTextContentContainer"> <tbody><tr> <td valign="top" class="mcnTextContent" style="padding-top:9px; padding-right: 18px; padding-bottom: 9px; padding-left: 18px;">'+text+'</td> </tr> </tbody></table> </td> </tr> </tbody> </table></td> </tr> <tr> <td valign="top" id="templateFooter"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowBlock" style="min-width:100%;"> <tbody class="mcnFollowBlockOuter"> <tr> <td align="center" valign="top" style="padding:9px" class="mcnFollowBlockInner"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentContainer" style="min-width:100%;"> <tbody><tr> <td align="center" style="padding-left:9px;padding-right:9px;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnFollowContent"> <tbody><tr> <td align="center" valign="top" style="padding-top:9px; padding-right:9px; padding-left:9px;"> <table align="center" border="0" cellpadding="0" cellspacing="0"> <tbody><tr> <td align="center" valign="top"> <!--[if mso]> <table align="center" border="0" cellspacing="0" cellpadding="0"> <tr> <![endif]--> <!--[if mso]> <td align="center" valign="top"> <![endif]--> <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;"> <tbody><tr> <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem"> <tbody><tr> <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;"> <table align="left" border="0" cellpadding="0" cellspacing="0" width=""> <tbody><tr> <td align="center" valign="middle" width="24" class="mcnFollowIconContent"> <a href="http://www.twitter.com/pqtmex" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-twitter-48.png" style="display:block;" height="24" width="24" class=""></a> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if mso]> </td> <![endif]--> <!--[if mso]> <td align="center" valign="top"> <![endif]--> <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;"> <tbody><tr> <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem"> <tbody><tr> <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;"> <table align="left" border="0" cellpadding="0" cellspacing="0" width=""> <tbody><tr> <td align="center" valign="middle" width="24" class="mcnFollowIconContent"> <a href="http://www.facebook.com/pqtmex" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-facebook-48.png" style="display:block;" height="24" width="24" class=""></a> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if mso]> </td> <![endif]--> <!--[if mso]> <td align="center" valign="top"> <![endif]--> <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;"> <tbody><tr> <td valign="top" style="padding-right:0; padding-bottom:9px;" class="mcnFollowContentItemContainer"> <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem"> <tbody><tr> <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;"> <table align="left" border="0" cellpadding="0" cellspacing="0" width=""> <tbody><tr> <td align="center" valign="middle" width="24" class="mcnFollowIconContent"> <a href="https://paquete.mx" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/color-link-48.png" style="display:block;" height="24" width="24" class=""></a> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <!--[if mso]> </td> <![endif]--> <!--[if mso]> </tr> </table> <![endif]--> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody> </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;"> <tbody class="mcnDividerBlockOuter"> <tr> <td class="mcnDividerBlockInner" style="min-width: 100%; padding: 10px 18px 25px;"> <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top-width: 2px;border-top-style: solid;border-top-color: #EEEEEE;"> <tbody><tr> <td> <span></span> </td> </tr> </tbody></table> <!-- <td class="mcnDividerBlockInner" style="padding: 18px;"> <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" /> --> </td> </tr> </tbody> </table></td> </tr> </table> <!--[if gte mso 9]> </td> </tr> </table> <![endif]--> <!-- // END TEMPLATE --> </td> </tr> </table> </center> </body> </html>';
}
/*email*/
