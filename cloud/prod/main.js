/*change log

3-Octubre-2017: Se crea la funcion para registrar el shipping
18-Octubre-2017: Se crea la funcion para guardar tarjetas
20-Octubre-2017: Se crea la funcion para cargar a las tarjetas
27-Diciembre-2017: Se elimina conekta y se agrega t-pago
6-Enero-2018: Se agregan las funciones de facturacion
9-Enero-2018: Se egrega procesamiento para cuenta enterprise
5-Febrero-2018: Se establecen ambientes desarrollo y produccion
16-Mayo-2018: Se agregan notificaciones para MKT
29-Mayo-2018: Se mueven las etiquetas a servidor en lugar de estar en objetos JSON.
06-Septiembre-2018: Se actualiza la API de T-PAGO de v1 a v2.
14-Noviembre-2018: Se agregan notificaciones de bloques de Redpack.
14-Noviembre-2018: Se agrega tipo de cupon.
28-Enero-2019: Se agregan nuevos cambios para la gestiÃ³n de contabilidad de los envÃ­os y facturas.
02-Febrero-2019: Se corrige un bug al guardar empresas vacÃ­as.
12-Febrero-2019: Reembolso de T-Pago.
04-Abril-2019: Depósitos a facturas.
17-Abril-2019: Módulo de caja chica.
20-Septiembre-2019: Implementacion de Timbox
01-Enero-2019: Reimplementacion de Conekta

change log*/

var moment = require("./moment");
var templates = require("./templates.js").templates;
var asyncEach = require("./each-series");
var conekta = require('conekta')
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
  emisor.cedula.RFC = "CTR150319NV9";
  var domain = "paquete.mx";
  Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-5e0f8c7de60172d4428cb1edbed23275'});
  var tPagoPublic = "u2oiwgTFEHht04tqeYq0MT06Np8ixXdU:eEXLhTxBiYo6fmFnWupvaeN7lyxuEAot";
  var tPagoPrivate = "u2oiwgTFEHht04tqeYq0MT06Np8ixXdU:ylBRVVpuwDBbg0joIeyRwgQeY3U7KHNr";
  var tPagoApiKey = "u2oiwgTFEHht04tqeYq0MT06Np8ixXdU";
  var tPagoBaseUrl = "https://gateway.tevi.life/"
  var appId = "OwwqTBzf9Tj618RyQqYmx3eJOhxaS8qolcojD3IA";
  var masterKey = "baplcn89UZ3uyJq0AflqtXjnFV2wRmo81SaWg7wd";
  var javascriptKey = "gCi0VgG0NVmtZA7lKsAAVVAvk9IwECg2GMJHwWdQ";
  var endpointFacturacion = "http://52.89.200.43/endpoint";
  var urlApi = "https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api";
  var invoiceUrl = "https://s3-us-west-2.amazonaws.com/paquetemx/invoices/";
  var saveLabel = "http://54.201.237.120/save_label.php";
  var labelUrl = "http://54.201.237.120/?trackingNumber=";
  var conektaPubKey = "key_XzkDy9QygkjzZR98m4hVR6A";
  var conektaPrvKey = "key_xdbyWberXgdQ6o1sEj5h3w";
}else{
  emisor.cedula.RFC = "MAG041126GT8";
  var domain = 'beta.paquete.mx';
  Mailgun = require('mailgun-js')({domain:domain, apiKey:'key-5e0f8c7de60172d4428cb1edbed23275'});
  var tPagoPublic = "o1l6WS88WX4pMlrfPVLyq7XK3RcIwGNU:eSeuVfxelH3WLCNV6zeZCzKFhkR2JFrw";
  var tPagoPrivate = "o1l6WS88WX4pMlrfPVLyq7XK3RcIwGNU:JOXVhXKn6bgVAi4yUMm7CoD5eEgCcrup";
  var tPagoApiKey = "o1l6WS88WX4pMlrfPVLyq7XK3RcIwGNU";
  var tPagoBaseUrl = "https://gateway.dev.tevi.life/"
  var appId = "T0oXH3vYBN7qiMNVEBijclU8OEyON6t1P5RW5Avv";
  var masterKey = "xqIqJPRHqq3h674UrUjVbrjp5oOySumkjsV5bK9H";
  var javascriptKey = "Xjos01wVXW2n54zAdsN4UEgn40PHw7BFzEedZE4a";
  var endpointFacturacion = "http://52.89.200.43/development";
  var urlApi = "https://mqxt7kvlib.execute-api.us-west-2.amazonaws.com/dev";
  var invoiceUrl = "https://s3-us-west-2.amazonaws.com/paquetemx/development/";
  var saveLabel = "http://54.201.237.120/save_label_dev.php";
  var labelUrl = "http://54.201.237.120/dev.php?trackingNumber=";
  var conektaPubKey = "key_BB4BYYVDmsGcm396nzKA4NQ";
  var conektaPrvKey = "key_FNTBjTxFXJt5KFkqRpyyGQ";
}


conekta.api_key = conektaPrvKey;
conekta.locale = 'es';

Parse.Cloud.define("saveCashMovement", function(request, response){
  var movement = request.params
  var CashMovements = Parse.Object.extend("CashMovements")
  var cashMovement = new CashMovements()

  cashMovement.set("invoice", movement.invoice)
  cashMovement.set("trackingNumber", movement.trackingNumber)
  cashMovement.set("amount", movement.amount)
  cashMovement.set("type", movement.type)
  cashMovement.set("active", true)
  cashMovement.save()

  response.success({
    "code": 1,
    "message": "Movimiento registrado exitosamente"
  })

})

Parse.Cloud.define("saveCash", function(request, response){

  var Cash = Parse.Object.extend("Cash")
  var cash = new Cash()

  cash.set("previous", request.params.previous)
  cash.set("current", request.params.current)
  cash.set("number", request.params.number)
  cash.set("movements", request.params.movements)
  cash.set("active", request.params.active)
  cash.save();

  /*      Sets as inactive all movements      */
  (function loop(i){
    if(i >= request.params.movements.length){
      response.success({
        "code": 1,
        "message": "Arqueo registrado exitosamente"
      })
    }else{
      var CashMovements = Parse.Object.extend('CashMovements')
      var query = new Parse.Query(CashMovements)
      query.equalTo('objectId', request.params.movements[ i ])
      query.first().then( movement => {
        if(movement){
          movement.set("active", false)
          movement.save()
        }
        loop(++i)
      })
    }
  })(0);

})



Parse.Cloud.define("saveSubCashMovement", function(request, response){
  var movement = request.params
  var SubCashMovement = Parse.Object.extend("SubCashMovement")
  var subCashMovement = new SubCashMovement()

  subCashMovement.set("name", movement.name)
  subCashMovement.set("note", movement.note)
  subCashMovement.set("amount", movement.amount)
  subCashMovement.set("type", movement.type)
  subCashMovement.set("remain", movement.remain)
  subCashMovement.set("active", true)
  subCashMovement.save()

  response.success({
    "code": 1,
    "message": "Movimiento de caja chica registrado exitosamente"
  })

})



Parse.Cloud.define("saveSubCash", function(request, response){

  var SubCash = Parse.Object.extend("SubCash")
  var subCash = new SubCash()

  subCash.set("current", request.params.current)
  subCash.set("movements", request.params.movements)
  subCash.save();

  /*      Sets as inactive all movements      */
  (function loop(i){
    if(i >= request.params.movements.length){
      response.success({
        "code": 1,
        "message": "Corte de caja realizado exitosamente"
      })
    }else{
      var SubCashMovement = Parse.Object.extend("SubCashMovement")
      var query = new Parse.Query(SubCashMovement)
      query.equalTo('objectId', request.params.movements[ i ])
      query.first().then( movement => {
        if(movement){
          movement.set("active", false)
          movement.save()
        }
        loop(++i)
      })
    }
  })(0);
})

Parse.Cloud.define("addDeposit", function( request, response ){
  var Accounting = Parse.Object.extend("Accounting")
  var accounting = new Accounting()
  accounting.set("type", request.params.type)
  accounting.set("invoicesId", request.params.invoicesId)
  accounting.set("invoicesNo", request.params.invoicesNo)
  accounting.set("totalInvoices", request.params.totalInvoices)
  accounting.set("totalDeposited", request.params.totalDeposited)
  accounting.set("difference", request.params.difference)
  accounting.set("originalRemains", request.params.originalRemains)
  accounting.set("advanceDates", request.params.advanceDates)
  accounting.set("date", request.params.date)

  accounting.save();


  /*      Sets all invoices as deposited      */
  (function loop(i){
    if(i >= request.params.invoices.length){
      response.success({
        "code": 1,
        "message": "Depósito agregado correctamente"
      })
    }else{
      var Invoice = Parse.Object.extend('Invoice')
      var query = new Parse.Query(Invoice)
      query.equalTo('objectId', request.params.invoices[ i ].objectId)
      query.first().then( invoice => {
        if(invoice){
          
          if( request.params.invoices[ i ].deposited)
            invoice.set("deposited", true)

          var remainAmount = invoice.get("remainAmount")
          
          if( remainAmount )
            invoice.set("remainAmount", remainAmount - request.params.invoices[ i ].depositedTotal)
          else
            invoice.set("remainAmount", request.params.invoices[ i ].amount - request.params.invoices[ i ].depositedTotal)

          invoice.save()
        }
        loop(++i)
      })
    }
  })(0);
})

Parse.Cloud.define("refundPayment",function(request, response){
  var payment = request.params
  var tPagoBody = {
    "token": payment.token,
    "order_id": payment.charge.order_id,
    "amount": payment.charge.amount,
    "auth_code": payment.authCode
  }

  var url = tPagoBaseUrl + "api/v1/transactions/refund/"
  Parse.Cloud.httpRequest({
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': tPagoPrivate
    },
    url: url,
    body: tPagoBody
  }).then(res => {
    res = res.data
    if(res.code == "00"){
      var Payment = Parse.Object.extend('Payment');
      var query = new Parse.Query(Payment);
      query.equalTo('objectId',payment.objectId);
      query.first().then(function(_payment){
        if(_payment){
          _payment.set("status", "Reembolsado")
          _payment.save()
          response.success({
            "code": 1,
            "message": "Pago reembolsado exitosamente"
          })
        }else{
          response.success({
            "code": 2,
            "message": "Pago reembolsado exitosamente, aunque no pudo ser actualizado en la base de datos"
          })
        }
      })
    }else if(res.code == "01"){
      response.success({
        "code": -1,
        "message": res.message
      })
    }else{
      response.success({
        "code": res.code || -404,
        "message": res.message || "Sin mensaje proporcionado" ,
        "response": res
      })
    }
    console.info(res)
    response.success(res)
  },function(err){
    if(err && err.data){
      err = err.data.error || err.data.detail
    }
    if(err == "You cannot cancel on this hour; contact your administrator")
      err = "No es posible reembolsar en este horario"
    response.success({
      "code": -2,
      "message": JSON.stringify(err)
    });
  }).catch(err => {
    console.error(err)
    response.reject(err)
  })
});

/*SEND NOTIFICATION MARKETING EMAIl*/
Parse.Cloud.define("sendNotification",function(request, response){
  var button = request.params.button;
  if(button){
    var to = "leads4@strave.com";
    var subject = "Click Notification: "+button;
    var date = moment().subtract(5,"hours").format("YYYY-MM-DDTHH:mm:ss");
    var html = "<h1>Click Notification: Boton "+button+"</h1><div>Se realizo click en el boton de "+button+".</div><h2>"+date+"</h2>";
    sendEmail(to, subject, html, false, false).then(function(){
      response.success();
    },function(err){
      response.error(err);
    })
  }else{
    response.error("Button event name is required");
  }
});
/*SEND NOTIFICATION MARKETING EMAIl*/

/*CREATE INVOICE*/
function createInvoice(user,account, amount, paid, payment, shipping, formaPago, items, invoiceType){
  if(!formaPago)
    formaPago = "04";

  if(!invoiceType)
    invoiceType = "shipping";

  paid = paid ==true?true:false;
  var parse_promise = new Parse.Promise();
  var trackingNumber = shipping.get("trackingNumber");
  getInvoceTotal('ingreso').then(function(folio){

    var RFC = "XAXX010101000";
    var razonSocial = "PUBLICO EN GENERAL";
    var satResponse = false;

    if(account.get('invoice')){
      RFC =  account.get("taxId");
      if(!RFC)
        RFC = "XAXX010101000";

      razonSocial = account.get("taxName");
      if(!razonSocial)
        razonSocial = "PUBLICO EN GENERAL";
    }

    /*var receptor = {
      'RFC'           : RFC,
      'razonSocial'   : razonSocial
    };*/
    var receptor = {
      'RFC'           : shipping.get("RFCReceptor"),
      'razonSocial'   : shipping.get("RazonSocialReceptor")
    };

    if(!items){
      var totalE = amount
      var valorUnitario = (amount/1.16).toFixed(2);

      items = [{
                    "claveSAT":"78102200",
                    "claveLocal": trackingNumber,
                    "cantidad": "1",
                    "claveUnidad": "E48",
                    "unidad":"Servicio",
                    "descripcion":"Servicio de mensajeria: "+trackingNumber,
                    "valorUnitario": valorUnitario,
                    "totalE": totalE
                  }];
    }

    var metodoPago = "PUE";
    if(paid){
      metodoPago = "PUE";
    }
    else{
      metodoPago = "PPD";
      formaPago = "99";
    }
    var serie =  "WSI";
    // var folio = "1";
    var newParams = {
                      'serie'     : serie,
                      'folio'     : folio,
                      'receptor'  : receptor,
                      'metodoPago': metodoPago,
                      'formaPago' : formaPago,
                      'items'     : items
                    };
    console.log("createInvoice:152");
    console.log(newParams);
    IngresoCFDI(newParams).then(function(params){
      return makeCFDI(params);
    }).then(function(res){

      console.log(res);

      if(res && res.cfdi){

        var satResponse =  res;
        var Invoice = Parse.Object.extend('Invoice');
        var invoice = new Invoice();


        var amount = parseFloat(res.cfdi.total);
        var subtotal = parseFloat(res.cfdi.subtotal);
        var iva = parseFloat(res.cfdi.iva);

        if(res.cfdi.UUID){
          invoice.set("UUID",res.cfdi.UUID);
        }

        var dueAmount = amount;
        if(paid)
          dueAmount = 0;

        invoice.set("cfdi",res.cfdi);
        invoice.set('amount', amount);
        invoice.set('paid', paid);
        invoice.set('dueAmount', dueAmount);
        invoice.set('cancelled', false);
        invoice.set('user', user);
        invoice.set('invoiceType', invoiceType);
        invoice.set('folio', res.cfdi.folio);
        invoice.set('serie', res.cfdi.serie);
        invoice.set('subtotal', subtotal);
        invoice.set('iva', iva);
        invoice.set('invoiceNo', res.cfdi.serie+res.cfdi.folio);
        invoice.set("account",account);
        invoice.set("receptor",receptor);
        invoice.set("deposited", false );

        if(shipping){
          invoice.set('shipping', shipping);
          invoice.set('trackingNumber', shipping.get("trackingNumber"));
        }
        return invoice.save();
      }else{
        var parse_promise2 = new Parse.Promise();
        parse_promise2.reject();
        return parse_promise2;
      }

    }).then(function(invoice){

      if(invoice && payment){
        payment.set('invoice', invoice)
        return payment.save();
      }else{
        parse_promise.resolve(satResponse);
      }
    }).then(function(){
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

Parse.Cloud.define("validateCoupon",function(request, response){
  var code = request.params.coupon;
  var user = request.user;
  var account;
  var discount;
  if(user){
    user.get('account').fetch().then(function(res){
      console.log(res);
      if(res){
        account = res;
        var Coupon = Parse.Object.extend('Coupon');
        var query = new Parse.Query(Coupon);
        query.equalTo('coupon',code);
        query.equalTo('account',account);
        query.equalTo('active',true);
        query.first().then(function(res){
          if(res){
            var discount = res.get('discount');
            var percentage = res.get('percentage');
            var times = res.get('times');
            var limit = res.get('limit');

            if(times+1 > limit){
              response.error({message: "Limit Exceded"});
            }
            response.success({discount: discount, percentage: percentage});
          }else{
            response.error({message: "Invalid Coupon"});        
          }
        },function(err){
          console.log(err);
        });
      }else{
        response.error({message: "Invalid Account"});    
      }

    },function(err){
      console.log(err);
    })

  }else{
    response.error({message: "Invalid User"});
  }
});

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

      if(params.carrier == "REDPACK"){
        shipping.set('pickupConfirmation', null);
        shipping.save().then(function(){
          var confirmation = randomString(5);
          response.success({confirmation:confirmation});
        });
      }else{

        var pickupConfirmation = shipping.get("pickupConfirmation");
        if(pickupConfirmation)
          body.pickupConfirmation = pickupConfirmation


        var url = urlApi+"/cancelpickup";
        Parse.Cloud.httpRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          url: url,
          body: body
        }).then(function(res){
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
            response.error({error:true, message:"Imposible cancelar recoleccion, intenta de nuevo por favor."});
          }
        },function(err){
          if(err && err.data && err.data.error){
            err = err.data.error;
          }
          response.error(err);
        });
      }
    }else{
      response.error({error:true, message:"Invalid trackingNumber"});
    }
  },function(err){
    response.error(err);
  })
});


function calculateAccountDebt(account){
  return new Promise((resolve, reject) => {
    var Invoice = Parse.Object.extend("Invoice")
    var query = new Parse.Query( Invoice )
    query.equalTo("paid", false)
    query.limit(99999)
    query.equalTo("cancelled", false)
    query.equalTo("account", account)

    query.find().then( results => {
      var due = 0;
      for( var i = 0 ; i < results.length ; i++ ){
        due += results[ i ].get("dueAmount")
      }
      resolve({dueAmount: due})
    })
  })
}


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


      
      if(shipping.get('carrier') == 'redpack' || shipping.get('carrier')  == "REDPACK"){

        var packages = "";
        for(var i=0; i< service.packages.length; i++){
          var width = service.packages[i].width;
          var length = service.packages[i].length;
          var height = service.packages[i].height;
          var weight = service.packages[i].weight;
          packages += '<div>Peso: '+weight+' Kg.</div>';
          packages += '<div>Alto: '+height+' cm</div>';
          packages += '<div>Ancho: '+width+' cm</div>';
          packages += '<div>Largo: '+length+' cm</div>';
          packages += '<div>-------------------</div>';
        }
        var confirmation = randomString(5);
        var html = '<h1>Recoleccion Redpack solicidata</h1>\
                    <h2>Guia</h2>\
                    <div>'+params.trackingNumber+'</div>\
                    <h2>Servicio</h2>\
                    <div>'+service.service.name+'</div>\
                    <h2>Fecha</h2>\
                    <div>'+body.date+'</div>\
                    <h2>Hora</h2>\
                    <div>'+params.schedule+'</div>\
                    <h2>Origen</h2>\
                    <div>Nombre:'+service.from.name+'</div>\
                    <div>Telefono:'+service.from.phone+'</div>\
                    <div>Email:'+service.from.email+'</div>\
                    <div>Calle:'+service.from.street+'</div>\
                    <div>Numero:'+service.from.number+'</div>\
                    <div>Interior:'+service.from.apt+'</div>\
                    <div>CP:'+service.from.zip+'</div>\
                    <div>Estado:'+service.from.state+'</div>\
                    <div>Ciudad:'+service.from.city+'</div>\
                    <h2>Destino</h2>\
                    <div>Nombre:'+service.to.name+'</div>\
                    <div>Telefono:'+service.to.phone+'</div>\
                    <div>Email:'+service.to.email+'</div>\
                    <div>Calle:'+service.to.street+'</div>\
                    <div>Numero:'+service.to.number+'</div>\
                    <div>Interior:'+service.to.apt+'</div>\
                    <div>CP:'+service.to.zip+'</div>\
                    <div>Estado:'+service.to.state+'</div>\
                    <div>Ciudad:'+service.to.city+'</div>\
                    <h2>Paquetes</h2>'+packages+'\
                    ';
        html = htmlTemplate(html);
        sendEmail('joe@paquete.mx;atencion@paquete.mx;diego@paquete.mx', "Recoleccion solicitada:"+params.trackingNumber+"!", html, false);
        shipping.set('pickupConfirmation',confirmation);
        shipping.save().then(function(){
          response.success({confirmation:confirmation});
        })
      }else{

        var url = urlApi+"/pickup";
        Parse.Cloud.httpRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          url: url,
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
            response.error({error:true, message:"Imposible agendar recoleccion, intenta de nuevo por favor."});
          }
        },function(err){
          if(err && err.data && err.data.error){
            err = err.data.error;
          }
          response.error(err);
        });
      }
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

  console.log( "RCV KEY" )
  console.log( recoveryKey )
  query.first().then(function(user){
    console.info( "USER RCV KEY" )
    console.info( user )
    if(user){
      response.success();
    }else{
      console.log("NO USER" )
      response.error();
    }
  },function(err){
    console.log("ERROR" )
    console.log(err )
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
        return sendEmail(email, "Â¡Recuperar Contrasena - Paquete.MX!", html, false);
      }).then(function(){
        response.success({recovery:true});
      },function(err){
        response.error(err);
      })
    }else{
      response.error({registered: false,message: "Correo Electronico no registrado."});
    }
  },function(err){
    response.error(err);
  })
  // response.success({email:email});
});

Parse.Cloud.define("saveCard",function(request, response){

  /*    Create Customer   */
  var c = request.params
  var user = request.user

        

  conekta.Customer.create({
    name: user.get("name"),
    email: user.get("username"),
    phone: user.get("phone"),
    payment_sources: [{
      token_id: c.token,
      type: 'card'
    }],
    shipping_contacts: [{
      phone: user.get("phone"),
      receiver: user.get("name"),
      address: {
        street1: c.address.street1,
        country: "MX",
        postal_code: c.address.zip
      }
    }]
  }, function(err, customer) {
      
      if( err )
        return response.error( err )

      customer = customer.toObject()

      let sourceId = customer.payment_sources.data[0].id

      var Card = Parse.Object.extend('Card');
      var card = new Card();
      card.set('token', c.token);

      if( c.name )
        card.set('name', c.name);
      if( c.termination )
        card.set('termination', c.termination);
      if( c.brand )
        card.set('brand', c.brand);
      if( c.address )
        card.set('address', c.address);
      if( c.birthDate )
        card.set('birthDate', c.birthDate);
      if( user )
        card.set('user',user);
      if( customer.id )
        card.set('customerId', customer.id);
      if( sourceId )
        card.set('sourceId', sourceId);

      card.save()
      .then( () => {
        response.success()
      })
      .catch( _err => {
        response.error( _err )
      })

  })


});

Parse.Cloud.define("sendCotizacion",function(request, response){
  var params = request.params;
  var to =  "<diego@paquete.mx>,<joe@paquete.mx>,<thalia@paquete.mx>";
  var subject =  "Cotizacion Solicitada";
  
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
  var contact = "Informacion de Contacto <br/><br/>";
  contact +="Nombre: "+name+"<br/>";
  contact +="Apellido: "+lastname+"<br/>";
  contact +="Telefono: "+phone+"<br/>";
  contact +="Correo Electronico: "+email+"<br/>";

  var html = "<h2>Solicitud de Cotizacion</h2>Pais Origen: "+fromCountry+"<br/>Codigo Postal Origen: "+fromZip+"<br/>Pais Destino: "+toCountry+"<br/>Codigo Postal Destino: "+toZip+"<br/>"+packagesList+"<br/>"+insurance+"<br/>"+contact;
  sendEmail(to, subject, html, false, false).then(function(res){
    response.success(res);
  },function(err){
    response.error(err);
  });

})

Parse.Cloud.beforeSave("Coupon", function(request, response){
  if(request.object.existed() === false){
    request.object.set("active", true);
    request.object.set("times", 0);
  }
  response.success();
});


/*  Notificaciones de bloques por terminarse de Redpack  */
Parse.Cloud.beforeSave("Redpack", function(request, response){
  var block = request.object;
  var available = block.get("available");
  if(available < 30 ){
    var service = block.get("service");
    var html, subject;
    subject = "Alerta de bloques de guias " + service + " de Redpack";
    html =  "<h2>Actualmente quedan <strong>" + available +
      "</strong> guias disponibles del bloque <strong>" + service +
      "</strong></h2><h3>Se recomienda hacer la solicitud de un nuevo bloque de guias</h3>";
    sendEmail("joe@paquete.mx;gerardo@paquete.mx;paquete@paquete.mx", subject, html, false, false);
  }
  response.success();

});





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
    request.object.set('creditLimit',0);
    request.object.set('creditAvailable',0);
    request.object.set('dueAmount',0);

    var name;
    if(type && type == 'enterprise'){
      name = request.object.get('companyName');
      name = name.toUpperCase();
    }
    else if(type && type == 'personal'){
      request.object.set('status',"active");
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
    var INE = request.object.get('INE');
    var comprobanteDomicilio = request.object.get('comprobanteDomicilio');
    var constanciaFiscal = request.object.get('constanciaFiscal');
    var caratulaBancaria =  request.object.get('caratulaBancaria');
    var autorizacionBuro =  request.object.get('autorizacionBuro');
    if(INE != "false" && comprobanteDomicilio != "false" && constanciaFiscal != "false" && caratulaBancaria != "false" && autorizacionBuro != "false"){
      request.object.set('status','waitingApproval');
    }

  }
  /*documentos*/

  response.success();

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

  var file = invoiceUrl+cfdi.UUID; 
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
    xmlBuffer = {data: data.buffer, filename: "factura.xml"};
    var attch = [new Mailgun.Attachment(pdfBuffer), new Mailgun.Attachment(xmlBuffer)];
    var html = htmlTemplate(templates.newInvoice(type,name, dataInfo, trackingNumber));

    console.log('send-email-3.4');
    var subject = "Â¡Se ha generado una nueva factura!";
    if(dataInfo.invoiceNo){
      if(type ==  'pago')
        subject = 'Complemento de Pago';
      else
        subject = 'Â¡Tu factura '+dataInfo.invoiceNo+' esta lista para descargarse!';
    }

    return sendEmail(email, subject, html, true, attch);
  });
}

Parse.Cloud.afterSave("Invoice",function(request){
  request.object.get("account").fetch().then(function(res){
    var account = res;
    if(request.object.existed() === false){
      var cfdi = request.object.get("cfdi");
      // console.log(cfdi.UUID);
      var data = {};
      var user;
      var trackingNumber;
      // request.object.get("account").fetch().then(function(res){
      // request.object.get("account").fetch().then(function(res){
        // account = res;

        var User = Parse.Object.extend("_User"); 
        var query = new Parse.Query(User);
        query.equalTo('account',account);
        query.first().then(function(res){
          user =  res;
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

    calculateAccountDebt(account).then(function(res){
      console.info("deuda");
      console.info(res);
      if(res && res.dueAmount >= 0){
        account.set('dueAmount', res.dueAmount);
        account.save();
      }
    },function(err){
      console.log(err);
    });
  });
});

/*Parse.Cloud.afterSave("Payment", function(request){
  console.log("BEFORE XXX")
  request.object.get("account").fetch().then(function(account){
    return calculateAccountDebt( account )
  })
  .then( res => {
    if(request.object.existed() === false){
      var cfdi = request.object.get("cfdi");
      var data = {};
      var user;
      var trackingNumber;

      var User = Parse.Object.extend("_User"); 
      var query = new Parse.Query(User);
      query.equalTo('account',account);
      query.first().then(function(res){
        user =  res;
        var data= {};

        if(account && account.get('taxName'))
          data.razonSocial = account.get('taxName');
        if(request.object.get('invoiceNo'))
          data.invoiceNo = request.object.get('invoiceNo');

        var email = false;
        if(user.get('username'))
          email = user.get('username');

        var name = false;
        if(user.get('name'))
          name = user.get('name');

        sendInvoice(cfdi,"pago", data, email, false, name);
      });
    }
  });
});*/

Parse.Cloud.beforeSave("Shipping",function(request,response){
  var original = request.original;

  if(request.object.existed() === false){
    request.object.set("active", true);
  }

  if(original){
    var service = request.object.get("service")
    var from = service.from.company || 'N-A'
    var to = service.to.company || 'N-A'
    service.from.company = from
    service.to.company = to
    request.object.set("service", service)
    request.object.save()
  }
  response.success();

});


Parse.Cloud.afterSave("_User", function(request){
  var user = request.object;
  if(!user.get('verifyKey')){
    if(user.get('accountType') == 'personal'){
      // pdfBuffer = {data: data.buffer, filename: trackingNumber+".pdf"};
      var name =  user.get('name');
      var html = templates.personalWelcome(name);
      html = htmlTemplate(html);
      // var attch = [new Mailgun.Attachment(pdfBuffer)];
      sendEmail(user.get('username'), "Â¡Bienvenido a PAQUETE.MX!", html, false, false).then(function(){
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
        sendEmail(user.get('username'), "Â¡Bienvenido a PAQUETE.MX!", html, false, attch).then(function(){
          var verifyKey = randomString(15);
          user.set("verifyKey", verifyKey);
          user.save(null,{useMasterKey:true});
        });
      });
    }

  }
});

var createOrder = function(paymentType, params, user){

  if( paymentType == "account")
    return Promise.resolve( false )
  else{
    let amount = Number(parseFloat(params.amount).toFixed(2)) * 100
    amount = Number(parseFloat(amount).toFixed(0))
    var conektaOrder = {
      "line_items": [{
          "name": "Servicio " + params.shipping.service.name,
          "unit_price": amount,
          "quantity": 1
      }],
      "currency": "MXN",
      "customer_info": {
        //'name': user.get("name") + " " + user.get("lastname"),
        //'email': user.get("username"),
        //'phone': user.get("phone"),
        "customer_id": params.paymentMethod.card.customerId
      },
      "charges":[{
        "payment_method": {
          'type': 'card',
          'payment_source_id': params.paymentMethod.card.sourceId
        }
      }]
    }

    console.log("Conekta Order Params", conektaOrder)

    return new Promise((resolve, reject) => {
      conekta.Order.create(conektaOrder, (err,order) => err ? reject( err ) : resolve( order ))
    })
  }
}

var submitOrder = function(type, user, amount){
  console.log("1")

  return new Promise((resolve, reject) => {
    console.log("checking user", user)
    user.get('account').fetch().then(function(account){
      console.log("account found", account)
      if(account && account.get('type') == 'enterprise'){
        console.log("p")
        if(account.get('verified') == true){
          console.log("d")
          //var amount = parseFloat(order.amount);
          if(amount && amount > 0){
            console.log("k")
            var dueAmount = account.get('dueAmount');
            var limit = account.get('creditLimit');
            var available = limit-dueAmount;
            var status = account.get('status');
            var verified = account.get('verified');

            if(verified && status == 'active' && available > amount){
              console.log("sssss")
              var auth = randomString(8);
              var params = {
                message : 'Aprobada',
                brand   : 'PQT',
                termination : '0000',
                reference   : "auth",
                auth_code   : "auth",
                amount      : amount,
                order_id    : "auth",
                type        : "account"
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
                resolve(params);
              },function(err){
                reject(err)
              });

            }else{
              reject({message:"Se ha alcanzado el limite de credito de la cuenta. Contactanos en hola@paquete.mx"});
            }
          }else{
            reject({message:"Invalid amount, must be greather than 0"});
          }
        }else{
          reject({message:"Invalid Account, need to verify"});
        }
      }else{
        console.log("IAP")
        reject({message:"Invalid Account Privileges"})
      }
    },function(err){
      reject(err)
    });
  })
  //  if(type=='account'){
  //}else{
  //  var parse_promise = new Parse.Promise();
  //  parse_promise.reject({message:"Invalid account Type"});
  //  return parse_promise
  //}
}


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
Parse.Cloud.define("simpleCharge",function(request, response){
  let params = request.params.order
  conekta.Order.create(params, (err,order) => err ? response.error( err ) : response.success({status: "ok"}) )
});

//CONEKTA CHARGE CARD
Parse.Cloud.define("chargeCard",function(request, response){

  var user = request.user;

  var paymentMethod = request.params.paymentMethod;
  var shipping = request.params.shipping;
  var amount = parseFloat( request.params.amount.toFixed(2) )
  var requestResult = {};
  var paymentSave;
  var paymentType = false;
  var paid = false;
  var account;

  paymentType = (paymentMethod && paymentMethod.card) ? "card" : "account"
  
  createOrder( paymentType, request.params, user )
  .then( order => {
    console.log("ORden", order)
    if( order ){ //Paid with card. Needs account credit update
      console.log("Paid with card. Needs account credit update")
      let result = order.toObject()

      console.log("Conekta Response", result)
      result.amount /= 100

      var Payment = Parse.Object.extend('Payment');
      var payment = new Payment();
      payment.set('user',user);
      payment.set('charge',result);
      payment.set('status', result.payment_status);
      payment.set('amount', result.amount);
      payment.set('brand', result.charges.data[0].payment_method.brand);
      payment.set('termination', result.charges.data[0].payment_method.last4);
      payment.set('authCode', result.charges.data[0].payment_method.auth_code);
      payment.set('type', paymentType)

      if(paymentType == 'card')
        payment.set('paid', true), paid = true
      
      paymentSave = payment;
      
      return payment.save()

    }else{
      return user.get('account').fetch().then(function(res){
        if(res)
          account = res;
        return submitOrder(paymentType, user, amount)
      })
    }
  }) 
  .then(function(result){
    console.log("asdasd", result)
    return sendShipOrder(user, shipping,requestResult.payment);
  })
  //.then(function(payment){
  //})
  .then(function(shipOrder){
    requestResult.shipping = shipOrder.shipping;
    requestResult.shipOrder = shipOrder.params;
    if(paymentSave ){
      paymentSave.set("shipping",shipOrder.shipping);
      return paymentSave.save();
    }
  })
  .then(function(){

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

    var trackingNumber = requestResult.shipping.get('trackingNumber');
    var packages = '<table><thead><tr><th style="padding: 10px">#</th><th>Largo</th style="padding: 10px"><th style="padding: 10px">Ancho</th><th style="padding: 10px">Alto</th><th style="padding: 10px">Peso</th></tr></thead><tbody>';
    for(var i=0; i<shipping.packages.length; i++){
      packages += '<tr><td style="padding: 10px">'+(i+1)+'</td><td style="padding: 10px">'+shipping.packages[i].length+' cms</td><td style="padding: 10px">'+shipping.packages[i].width+' cms</td><td style="padding: 10px">'+shipping.packages[i].height+' cms</td><td style="padding: 10px">'+shipping.packages[i].weight+' Kg</td></tr>';
    }
    packages += "</tbody></table>";

    /*  payment */
    //paymentSave.set("trackingNumber", trackingNumber)

    var file = labelUrl+trackingNumber; 
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

  })
  .then(function(){
    response.success(requestResult);
  },function(error){
    response.error(error);
  });
});


Parse.Cloud.define("invoiceShipping",function(request, response){
  var trackingNumber = request.params.trackingNumber;
  var formaPago = request.params.formaPago;
  var invoiceType = request.params.invoiceType;
  var items = request.params.items;
  var paid = request.params.paid;

  paid = paid == true || paid =="true"?true:false;
  var user = request.user;
  if(!trackingNumber)
    return response.error({error:true,message:"Invalid trackingNumber"});

  var Shipping = Parse.Object.extend("Shipping"); 
  var query = new Parse.Query(Shipping);
  var shipping;
  var account;
  query.equalTo('trackingNumber', trackingNumber);
  query.first().then(function(res){
    if(res)
      shipping = res;
    else
      response.error({error:true, message:"trackingNumber not found"});
    return shipping.get('account').fetch();
  }).then(function(res){
    if(res)
      account = res;
    else
      response.error({error:true, message:"account not found"});

    var amount =  shipping.get('paymentAmount');
    response.success("XLR28");
  })

});

/*Parse.Cloud.beforeSave("Payment",function(request, response){
  console.info("BEFORE ENTERING BEFORE SAVE PAYMENT")
  if(request.object.existed() === false && !request.object.get('paid')){
    console.info("AFTER ENTERING BEFORE SAVE PAYMENT")
    var folio;
    getInvoceTotal('pago').then(function(folioId){
      folio = folioId;

      var tags =[];
      var serie = "WSP";
      var relInvoice = request.object.get('invoice');
      var formaDePagoP = request.object.get('metodoPago');

      if(!formaDePagoP){
        formaDePagoP = "03";
      }
      request.object.set('originalAmount', request.object.get('amount'));
      request.object.set('invoiceNo', serie+folio);

      var invoice;
      var account;
      var shipping = false;
      relInvoice.fetch().then(function(result){
        invoice = result;
        return invoice.get('account').fetch();
      }).then(function(result){
        account = result;
        request.object.set('account', account);

        if(invoice.get('shipping'))
          return invoice.get('shipping').fetch();
        else
          return false
      }).then(function(res){
        if( res ) //Has shipping
          shipping = res;
        var RFC = account.get('taxId');
        var razonSocial = account.get('taxName');
        var receptor = {
          'RFC'           : shipping ? shipping.get("RFCReceptor") : invoice.get("receptor").RFC,
          'razonSocial'   : shipping ? shipping.get("RazonSocialReceptor") : invoice.get("receptor").razonSocial
        };

        var parcialidad = invoice.get('parcialidad')?invoice.get('parcialidad'):1;


        var dueAmount = parseFloat(invoice.get('dueAmount'));
        var impPagado = parseFloat(request.object.get('amount'));

        if(impPagado > dueAmount){
          impPagado = dueAmount;
        }

        var date = moment().subtract(5,"hours").format("YYYY-MM-DDTHH:mm:ss");
        var newParams = {
            'serie'     : serie,
            'folio'     : folio,
            'receptor'  : receptor,
            "pagos"     :[
              {
                "fechaPago": date,
                "formaDePagoP": formaDePagoP,
                "monedaP":"MXN",
                "monto": impPagado,
                "documentos":[
                {
                  "idDocumento": invoice.get('cfdi').UUID,
                  "serie":invoice.get('serie'),
                  "folio":invoice.get('folio'),
                  "monedaDR":"MXN",
                  "numParcialidad": parcialidad,
                  "impSaldoAnt": dueAmount,
                  "impPagado": impPagado
                }
              ]
              }
            ]
          };

        return PagoCFDI(newParams);
      }).then(function(params){
        return makeCFDI(params);
      }).then(function(params){
        if(params && params.cfdi){
         
          var folio = params.cfdi.folio;
          var serie = params.cfdi.serie;
          
          if(!request.object.get("reference")){
            var reference = invoice.get('invoiceNo');
            request.object.set("reference",reference);
          }

          request.object.set("cfdi",params.cfdi);

          if(params.cfdi.UUID){
            request.object.set("UUID",params.cfdi.UUID);
          }


          request.object.set("folio",folio);
          request.object.set("serie",serie);
          request.object.set("shipping",shipping || undefined);
          request.object.set("cancelled",false);
        }
        var dueAmount =  invoice.get('dueAmount');
        dueAmount = dueAmount - request.object.get('amount');

        if(dueAmount == 0){
          invoice.set('paid', true);
        }
        else if(dueAmount < 0){
          request.object.set('amount',invoice.get('dueAmount'));
          var Advance = Parse.Object.extend("Advance"); 
          var advance = new Advance();
          dueAmount = dueAmount*(-1);
          advance.set('account', account);
          advance.set('metodoPago', formaDePagoP);
          advance.set('amount', parseFloat(dueAmount.toFixed(2)));
          advance.set('description','Anticipo');
          if(request.object.get('paymentGateway')){
            advance.set('paymentGateway', request.object.get('paymentGateway'));
          }
          advance.save();
          dueAmount = 0;
          invoice.set('paid', true);
        }


        invoice.set('dueAmount', dueAmount);

        

        return invoice.save();
      }).then(function(invoice){
        if(invoice && invoice.get("paid")==true && shipping){
          shipping.set("paid", true);
          return shipping.save();
        }else{
          response.success();    
        }
      }).then(function(){
          response.success();
      },function(err){
        response.error(err);
      });

    },function(err){
      repsonse.error(err);
    });
  }else{
    response.success();
  }

});*/

function PagoCFDI(params){
  var parse_promise = new Parse.Promise();
  if(!params.serie)
    parse_promise.reject({error:true,message:'serie is required'});
  else if(!params.folio)
    parse_promise.reject({error:true,message:'folio is required'});
  else if(!params.receptor)
    parse_promise.reject({error:true,message:'receptor is required'});
  else if(!params.pagos)
    parse_promise.reject({error:true,message:'pagos is required'});
  else{

    console.log("receivedParams.PagoCFDI:1833");
    console.log( params )

    var newParams = {  
              "serie": params.serie,
              "folio": params.folio,
              "formaPago": params.pagos[ 0 ].formaPago,
              "metodoPago": params.pagos[ 0 ].metodoPago,
              "lugarExpedicion": emisor.CP,
              "tipoDeComprobante":"P",
              "usoCFDI":"P01",
              "monto": params.pagos[ 0 ].monto,
              "receptor": params.receptor,
              "emisor": emisor.cedula,
              "pagos" : params.pagos
            };

    if(params.cuenta){
      newParams.cuenta = params.cuenta;
    }
    if(params.clabe){
      newParams.clabe = params.clabe;
    }
    if(params.clientId){
      newParams.clientId = params.clientId;
    }

    console.log("newParams.PagoCFDI:1856");
    console.log(newParams);
    parse_promise.resolve(newParams);
    
  }
  return parse_promise;
}

Parse.Cloud.define("checkTaxId",function(request, response){
  var taxId = request.params.taxId;
  validaRFC(taxId).then(function(res){
    response.success(res);
  },function(err){
    response.error(err);
  })
});


function validaRFC(taxId){
  var parse_promise = new Parse.Promise();

  var url = endpointFacturacion+'/statusRFC.php';

  var method = 'POST';
  var params = {taxId:taxId};

  Parse.Cloud.httpRequest({
  method: method,
  headers: {
    'Content-Type': 'application/json'
  },
  url: url,
  body: params
  }).then(function(response){
    if(response && response.text){
      var res = JSON.parse(response.text);
      parse_promise.resolve(res);
    }
    else{
      parse_promise.resolve(response);
    }
  },function(err){
    parse_promise.reject(err);
  });
  return parse_promise;
}

function cancelCFDI(params){
  var parse_promise = new Parse.Promise();

  if(!params || !params.UUID)
    parse_promise.reject({error:"UUID is required"});

  var url = endpointFacturacion+'/cancelacion.php';

  var method = 'POST';

  Parse.Cloud.httpRequest({
  method: method,
  headers: {
    'Content-Type': 'application/json'
  },
  url: url,
  body: params
  }).then(function(response){
    parse_promise.resolve(response.text);
  },function(err){
    parse_promise.reject(err);
  });

  return parse_promise;

}


Parse.Cloud.define("cancelInvoice",function(request, response){
  var UUID = request.params.UUID;

  if(!UUID){
    response.error({error:"UUID is required"});
  }

  var resp;
  var findIt = false;
  cancelCFDI({UUID:UUID}).then(function(res){
    res = JSON.parse(res);
    resp = res;
    var Invoice = Parse.Object.extend('Invoice');
    var query = new Parse.Query(Invoice);
    query.equalTo("UUID",UUID);

    return query.first()
  }).then(function(res){
    if(res){
      findIt =  true;
      invoice =  res;
      invoice.set("cancelled", true);
      return invoice.save();
    }else{
      var Payment = Parse.Object.extend('Payment');
      var query = new Parse.Query(Payment);
      query.equalTo("UUID",UUID);
      return query.first();        
    }
  }).then(function(payment){

    if(findIt){
      var parse_promise = new Parse.Promise();
      parse_promise.resolve(false);
      return parse_promise;
    }else{
      if(payment){
        findIt =  true;
        payment.set("cancelled", true);
        return payment.save();
      }else{
        var Outcome = Parse.Object.extend('Outcome');
        var query = new Parse.Query(Outcome);
        query.equalTo("UUID",UUID);
        return query.first(); 
      }
    }
  }).then(function(outcome){
    if(findIt){
      var parse_promise = new Parse.Promise();
      parse_promise.resolve(false);
      return parse_promise;
    }else{
      if(outcome){
        findIt =  true;
        outcome.set("cancelled", true);
        return outcome.save();
      }else{
        var Advance = Parse.Object.extend('Advance');
        var query = new Parse.Query(Advance);
        query.equalTo("UUID",UUID);
        return query.first(); 
      }
    }
  }).then(function(advance){
    if(findIt){
      var parse_promise = new Parse.Promise();
      parse_promise.resolve(false);
      return parse_promise;
    }else{
      if(advance){
        findIt =  true;
        advance.set("cancelled", true);
        return advance.save();
      }else{
        var parse_promise = new Parse.Promise();
        parse_promise.resolve(false);
        return parse_promise;
      }
    }
  }).then(function(){
    response.success(resp);
  },function(err){
    console.log(err);
    var error = JSON.parse(err);
    response.error(error);
  });
});

Parse.Cloud.beforeSave("Outcome",function(request, response){
  if(request.object.existed() === false){
    var serie = "WSE";
    var folio;
    var invoice;
    var shipping
    var account;
    var receptor;
    var amount;
    var descripcion;
    getInvoceTotal('egreso').then(function(res){
      folio = res;
      return request.object.get("invoice").fetch();
    }).then(function(res){
      invoice = res;
      return invoice.get("shipping").fetch();
    }).then(function(res){
      shipping = res;
      amount = request.object.get("amount");
      descripcion = request.object.get("description");
      request.object.set("applied", false);
      request.object.set("cancelled", false);
      
      request.object.get('account').fetch().then(function(result){
        account = result;
        var rfc = account.get('taxId');
        var razonSocial = account.get('taxName');

        receptor = {
          'RFC'           : rfc,
          'razonSocial'   : razonSocial
        };

        if(request.object.get('invoice')){
          return request.object.get('invoice').fetch();
        }else{
          var parse_promise = new Parse.Promise();
          parse_promise.resolve(false);
          return parse_promise;
        }

      }).then(function(result){
        invoice = result;

        var newParams = {
          'serie'     : serie,
          'folio'     : folio,
          'receptor'  : receptor,
          'metodoPago': 'PUE',
          'formaPago' : '99', // Por definir en caso de anticipo
          'monto'     : amount,
          'descripcion' : descripcion
        };


        if(invoice && invoice.get("cfdi") && invoice.get("cfdi").UUID){
          console.log(invoice.get("cfdi").UUID);

          var tipoRelacion = "01";
          if(request.object.get("relationType") == "anticipo"){
            tipoRelacion = "07";
          }

          request.object.set("tipoRelacion", tipoRelacion);


          newParams.relacionados ={
            "tipoRelacion" : tipoRelacion,
            "documentos":[
              {"UUID": invoice.get("cfdi").UUID}
            ]
          }
        }

        return EgresoCFDI(newParams);
      }).then(function(params){
        return makeCFDI(params);
      }).then(function(params){
        console.log("params:2096");
        console.log(params);

        if(params && params.cfdi){
       
          var folio = params.cfdi.folio;
          var serie = params.cfdi.serie;
          // var reference = serie+folio;
          var reference = invoice.get("invoiceNo");

          request.object.set("reference",reference);
          request.object.set("cfdi",params.cfdi);
          request.object.set("invoiceNo",serie+folio);

          if(params.cfdi.UUID){
            request.object.set("UUID",params.cfdi.UUID);
          }

          request.object.set("amount",params.cfdi.total);
          request.object.set("subtotal",params.cfdi.subtotal);
          request.object.set("folio",folio);
          request.object.set("serie",serie);
          request.object.set("shipping",shipping);
          request.object.set("applied",false);

          if(invoice && invoice.get("cfdi") && invoice.get("cfdi").UUID){
            var dueAmount =  parseFloat(invoice.get('dueAmount'));
            var cfdiTotal = parseFloat(params.cfdi.total);
            var difference = dueAmount - cfdiTotal;
            difference = difference > 0 ? difference : 0;
            difference = parseFloat(difference.toFixed(2));
            if(difference == 0){
              invoice.set('paid', true);
            }
            invoice.set('dueAmount',difference);
            return invoice.save();
          }else{
            var parse_promise = new Parse.Promise();
            parse_promise.resolve(true);
            return parse_promise;
          }

        }else{
          var parse_promise = new Parse.Promise();
          parse_promise.reject("Invalid CFDI without UUID");
          return parse_promise;
        }


      }).then(function(invoice){
        if(invoice && invoice.get("paid") == true){
          shipping.set("paid",true);
          return shipping.save();
        }else{
          response.success();
        }
      }).then(function(){
        response.success();
      },function(err){
        response.error(err);
      });
    },function(err){
      response.error(err);
    });
  }else{
    response.success();
  }
});

/*CREACION DE LA FACTURA FISCAL*/
function makeCFDI(params){
  var parse_promise = new Parse.Promise();

  var url =  endpointFacturacion+'/index.php';
  
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
    console.log("****** RESPONSE SAT PARAMS:2214 ******");
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

function EgresoCFDI(params){
  var parse_promise = new Parse.Promise();
  if(!params.serie)
    parse_promise.reject({error:true,message:'serie is required'});
  else if(!params.folio)
    parse_promise.reject({error:true,message:'folio is required'});
  else if(!params.receptor)
    parse_promise.reject({error:true,message:'receptor is required'});
  else if(!params.metodoPago)
    parse_promise.reject({error:true,message:'metodoPago is required'});
  else if(!params.formaPago)
    parse_promise.reject({error:true,message:'formaPago is required'});
  else if(!params.monto)
    parse_promise.reject({error:true,message:'monto is required'});
  else if(!params.descripcion)
    parse_promise.reject({error:true,message:'descripcion is required'});
  else{

    var newParams = {  
                    "serie": params.serie,
                    "folio": params.folio,
                    "formaPago": params.formaPago,
                    "metodoPago": params.metodoPago,
                    "lugarExpedicion": emisor.CP,
                    "tipoDeComprobante":"E",
                    "usoCFDI":"G02",
                    "monto": params.monto,
                    "descripcion": params.descripcion,
                    "receptor": params.receptor,
                    "emisor": emisor.cedula
                  };

    if(params.cuenta){
      newParams.cuenta = params.cuenta;
    }
    if(params.clabe){
      newParams.clabe = params.clabe;
    }
    if(params.clientId){
      newParams.clientId = params.clientId;
    }

    if(params.relacionados && params.relacionados.documentos){
      newParams.relacionados = params.relacionados;
    }

    parse_promise.resolve(newParams);
  }
  return parse_promise;
}
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

function sendShipOrder(user, shipping, payment) {
  console.log("sendShipOrder")
  var parse_promise = new Parse.Promise();

  var params ={};

  var body = {
    type      : shipping.service.service,
    shipping  : shipping
  }

  var url = urlApi+"/ship";

  Parse.Cloud.httpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    url: url,
    body: body
  }).then(function(result){
    var Shipping = Parse.Object.extend('Shipping');
    var shipping = new Shipping();

    var Account = Parse.Object.extend('Account');
    var account = new Account();

    account.id = user.get('account').id;
    if(account.id)
      shipping.set("account",account);

    if(payment && payment.type == 'card'){
      shipping.set("paid", true);
    }else{
      shipping.set("paid", false);
    }

    shipping.set("user",user);

    if(result.text){
      result =  JSON.parse(result.text);


      Parse.Cloud.httpRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        url: saveLabel,
        body: {trackingNumber:result.trackingNumber, packages: result.packages}
      });

      var list= [];
      for(var i=0; i<result.packages.length; i++){
        list.push({TrackingNumber:result.packages[i].TrackingNumber});
      }

      params = {
        carrier: body.type.toUpperCase(),
        trackingNumber: result.trackingNumber,
        packages: list,
        status:'label_created',
        delivered: false,
        service: body.shipping,
        content: body.shipping.content,
        RFCReceptor: body.shipping.RFCReceptor,
        RazonSocialReceptor: body.shipping.RazonSocialReceptor,
        commission: Number(body.shipping.commission || 0),
        iva: Number(body.shipping.iva || 0),
        cost: Number(body.shipping.cost || 0),
        subtotal: Number(body.shipping.subtotal || 0),
        sale: Number(body.shipping.sale || 0),
        profit: Number(body.shipping.profit || 0)
      }
    }

    if(payment){

      if(payment.amount)
        params.paymentAmount = payment.amount;
      if(payment.message)
        params.paymentStatus = payment.message;
      params.charge = payment;
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

  // if(bcc){
  // }

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