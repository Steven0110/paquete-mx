var https = require("http");
var convert = require('xml-to-json-promise');
var Parse = require('parse/node').Parse;


function getGuia(service){
  var production = false;
  if(production){
    console.log('We are in production!');
    masterKey = "baplcn89UZ3uyJq0AflqtXjnFV2wRmo81SaWg7wd";
    appId = "OwwqTBzf9Tj618RyQqYmx3eJOhxaS8qolcojD3IA";
    javascriptKey = "gCi0VgG0NVmtZA7lKsAAVVAvk9IwECg2GMJHwWdQ";
  }else{
    console.log('We are in development!');
    masterKey = "rZx1h8G9530G73xbzk5F1MLvGzb080KL2u55uC8S";
    appId = "OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1";
    javascriptKey = "wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL";
  }


  Parse.serverURL = 'https://parseapi.back4app.com/';
  Parse.initialize(appId, javascriptKey, masterKey);

  var parse_promise = new Parse.Promise();
  var Redpack = Parse.Object.extend('Redpack');
  var query = new Parse.Query(Redpack);
  query.equalTo('active',true);
  query.equalTo('service',service);
  query.ascending("createdAt");
  var response = {};

  query.first().then(function(redpack){
    if(redpack){
      var start = redpack.get("start");
      var end = redpack.get("end");
      var current = redpack.get("current");
      var guia = ++current;
      var available = redpack.get("available");
      if(guia >= start && guia <= end){
        available--;
        redpack.set("current", guia);
        redpack.set("available",available);

        if(available == 0 || guia == end){
          redpack.set("active", false);
        }
        response.guia = guia;
        return redpack.save();
      }else{
        var promise2 = new Parse.Promise();
        promise2.resolve(false);
        return promise2;
      }
    }else{
      var promise1 = new Parse.Promise();
      promise1.resolve(false);
      return promise1;
    }
  }).then(function(res){
    if(res)
      parse_promise.resolve(response);
    else
      parse_promise.resolve(false);
  },function(err){
    parse_promise.reject(err);
  });

  return parse_promise;
}

function generateError(code, message){
    return JSON.stringify({"status":code,"error":message});
}

function IterateOver(list, iterator, callBack) {
    var doneCount = 0;  
    function report() {
        doneCount++;
        if(doneCount === list.length)
            callBack();
    }
    for(var i = 0; i < list.length; i++) {
        iterator(list[i], i, report)
    }
}

var ship = function(data,success,error){
    var production =  false;
    var headers = {
      'Content-Type': 'text/xml',
    }

    var hostname = "ws.redpack.com.mx";
    var path = '/RedpackAPI_WS/services/RedpackWS?wsdl'
    if(production){
      hostname =  "";
      path = '/RedpackAPI_WS/services/RedpackWS?wsdl'
    }


    var options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: headers
    };
    var req =   https.request(options, function(res) {
                    // res.setEncoding('utf8');
                    var body ="";
                    res.on('data', function (result) {
                        body+=result;
                    });
                    res.on('end',function(){
                        success(body);
                    });
                }).on('error', function(err) {
                    error(err);
                })
    // data = JSON.stringify(data);
    req.write(data);
    req.end();
}


exports.handler = (event, context, callback) => {
    // var event = {
    //       "debugging": true,
    //       "packagingType": "package",
    //       "from": {
    //         "name": "Carlos Canizal",
    //         "phone": "5535068102",
    //         "street": "Rio Misisipi",
    //         "number": "Mz 45",
    //         "apt": "Lt 42",
    //         "county": "Puente Blanco",
    //         "city": "Iztapalapa",
    //         "state": "Ciudad de México",
    //         "country": {
    //           "code": "MX"
    //         },
    //         "zip": "09770"
    //       },
    //       "to": {
    //         "name": "Carlos Canizal",
    //         "phone": "5535068102",
    //         "street": "Hamburgo",
    //         "number": "70",
    //         "apt": "201",
    //         "county": "Juarez",
    //         "city": "Cuauhtemoc",
    //         "state": "Ciudad de México",
    //         "country": {
    //           "code": "MX"
    //         },
    //         "zip": "06600"
    //       },
    //       "service": {
    //         "code": "2"
    //       },
    //       "packages": [
    //         {
    //           "width": "25",
    //           "weight": "1",
    //           "length": "25",
    //           "height": "25"
    //         },
    //         {
    //           "width": "25",
    //           "weight": "1",
    //           "length": "25",
    //           "height": "25"
    //         }
    //       ]
    //     };
    var body ="";
    if(event){
        var data = event;
        var fromZip = false;
        var toZip = false;
        var debugging = false;
        
        if(data.debugging){
            debugging = true;
        }

        if(data.service){
          if(!data.service.code){
            context.fail(generateError(400,"service code is required in service attribute."));  
          }
        }else{
          context.fail(generateError(400,"fedex service data is required."));
        }
        
        if(data.from){
          if(!data.from.zip){
            context.fail(generateError(400,"zip value is required in from attribute."));
          }
          if(!data.from.country){
            context.fail(generateError(400,"cuntry value is required in from attribute."));
          }
          if(!data.from.street){
            context.fail(generateError(400,"street value is required in from attribute."));
          }
          if(!data.from.number){
            context.fail(generateError(400,"number value is required in from attribute."));
          }
          // if(!data.from.apt){
            // context.fail(generateError(400,"apt value is required in from attribute."));
          // }
          if(!data.from.county){
            context.fail(generateError(400,"county value is required in from attribute."));
          }
          if(!data.from.state){
            context.fail(generateError(400,"state value is required in from attribute."));
          }
        }else{
            context.fail(generateError(400,"from data is required."));
        }

        if(data.to){
          if(!data.to.zip){
            context.fail(generateError(400,"zip value is required in to attribute."));
          }
          if(!data.to.country){
            context.fail(generateError(400,"cuntry value is required in to attribute."));
          }
          if(!data.to.street){
            context.fail(generateError(400,"street value is required in to attribute."));
          }
          if(!data.to.number){
            context.fail(generateError(400,"number value is required in to attribute."));
          }
          // if(!data.to.apt){
            // context.fail(generateError(400,"apt value is required in to attribute."));
          // }
          if(!data.to.county){
            context.fail(generateError(400,"county value is required in to attribute."));
          }
          if(!data.to.state){
            context.fail(generateError(400,"state value is required in to attribute."));
          }
        }else{
            context.fail(generateError(400,"to data is required."));
        }
        
        
        if(data.packages && data.packages.length > 0){
            var packages = "";
            var aux =[];
            var limit =  data.packages.length;
            var start = 4;
            IterateOver(data.packages,function(item, index){
                var dimensions = {
                    width: null,
                    height: null,
                    length: null,
                    weight: null
                };
                
                if(item.length){
                    dimensions.length = item.length;
                }else{
                    callback(generateError(400,"No leght value in package "+index+"."),null);
                }
                
                if(item.width){
                    dimensions.width = item.width;
                }else{
                    callback(generateError(400,"No width value in package "+index+"."),null);
                }
                
                if(item.height){
                    dimensions.height = item.height;
                }else{
                    callback(generateError(400,"No height value in package "+index+"."),null);
                }
                
                if(item.weight){
                    dimensions.weight = item.weight;
                }else{
                    callback(generateError(400,"No weight value in package "+index+"."),null);
                }
                
                // packages += '<ns'+(index+start)+':paquetes xmlns:ns'+(index+start)+'="http://vo.redpack.com/xsd"><ns'+(index+1)+':alto>'+dimensions.height+'</ns'+(index+1)+':alto><ns'+(index+1)+':ancho>'+dimensions.width+'</ns'+(index+1)+':ancho><ns'+(index+1)+':largo>'+dimensions.length+'</ns'+(index+1)+':largo><ns'+(index+1)+':peso>'+dimensions.weight+'</ns'+(index+1)+':peso></ns'+(index+1)+':paquetes>';
                packages += '<ns'+(index+start)+':paquetes xmlns:ns'+(index+start)+'="http://vo.redpack.com/xsd"><ns'+(index+start)+':alto>'+dimensions.height+'</ns'+(index+start)+':alto><ns'+(index+start)+':ancho>'+dimensions.width+'</ns'+(index+start)+':ancho><ns'+(index+start)+':largo>'+dimensions.length+'</ns'+(index+start)+':largo><ns'+(index+start)+':peso>'+dimensions.weight+'</ns'+(index+start)+':peso></ns'+(index+start)+':paquetes>';
                
                aux.push(packages);
                // callBack();
            });
        }else{
            callback(generateError(400,"We need at least 1 package dimensions."),null);
        }
        
        
        // console.log('canizal');
        // body = '<?xmln version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><cotizacionNacional xmlns="http://ws.redpack.com"><PIN>QA j54/PyzkOAeMZzGPNFBpP/y8thMFFdZfbqZTWYQ8sjw=</PIN><idUsuario>785</idUsuario><guias><ns1:consignatario xmlns:ns1="http://vo.redpack.com/xsd"><ns1:codigoPostal>7270</ns1:codigoPostal></ns1:consignatario><ns2:paquetes xmlns:ns2="http://vo.redpack.com/xsd"><ns2:alto>0</ns2:alto>'+packages+'<ns'+(limit+start)+':remitente xmlns:ns'+(limit+start)+'="http://vo.redpack.com/xsd"><ns'+(limit+start)+':codigoPostal>1120</ns'+(limit+start)+':codigoPostal></ns'+(limit+start)+':remitente><ns'+(limit+start+1)+':tipoEntrega xmlns:ns'+(limit+start+1)+'="http://vo.redpack.com/xsd"><ns'+(limit+start+1)+':id>1</ns'+(limit+start+1)+':id></ns'+(limit+start+1)+':tipoEntrega></guias></cotizacionNacional></soapenv:Body></soapenv:Envelope>';
        var pin = "PROD j54/PyzkOAeMZzGPNFBpP/y8thMFFdZfbqZTWYQ8sjw=";
        var idUsuario = "785";
        
        var fromInterior = "";
        if(data.from.apt)
          fromInterior = data.from.apt;
        
        var toInterior = "";
        if(data.to.apt)
          toInterior = data.to.apt;
        
        getGuia(data.service.name).then(function(res){
            if(res && res.guia){
                var trackingNumber = (res.guia).toString();
                body ='<?xml version="1.0" encoding="UTF-8"?>\
                    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://vo.redpack.com/xsd">\
                      <soapenv:Body>\
                        <predocumentacion xmlns="http://ws.redpack.com">\
                          <PIN>'+pin+'</PIN>\
                          <idUsuario>'+idUsuario+'</idUsuario>\
                          <guias>\
                            <ns1:consignatario xmlns:ns1="http://vo.redpack.com/xsd">\
                              <ns1:calle>'+data.to.street+'</ns1:calle>\
                              <ns1:ciudad>'+data.to.city+'</ns1:ciudad>\
                              <ns1:codigoPostal>'+data.to.zip+'</ns1:codigoPostal>\
                              <ns1:colonia_Asentamiento>'+data.to.county+'</ns1:colonia_Asentamiento>\
                              <ns1:contacto>'+data.to.name+'</ns1:contacto>\
                              <ns1:email>'+data.to.email+'</ns1:email>\
                              <ns1:estado>'+data.to.state+'</ns1:estado>\
                              <ns1:numeroExterior>'+data.to.number+'</ns1:numeroExterior>\
                              <ns1:numeroInterior>'+toInterior+'</ns1:numeroInterior>\
                              <ns1:pais>Mexico</ns1:pais>\
                              <ns1:telefonos>\
                                <ns1:telefono>'+data.to.phone+'</ns1:telefono>\
                              </ns1:telefonos>\
                            </ns1:consignatario>'+packages+'\
                            <ns2:moneda>1</ns2:moneda>\
                            <ns2:numeroDeGuia>'+trackingNumber+'</ns2:numeroDeGuia>\
                            <ns2:tipoEnvio>\
                            <ns2:id>1</ns2:id>\
                            </ns2:tipoEnvio>\
                            <ns2:tipoServicio>\
                            <ns2:id>'+data.service.code+'</ns2:id>\
                            </ns2:tipoServicio>\
                            <ns4:remitente xmlns:ns4="http://vo.redpack.com/xsd">\
                              <ns4:calle>'+data.from.street+'</ns4:calle>\
                              <ns4:ciudad>'+data.from.city+'</ns4:ciudad>\
                              <ns4:codigoPostal>'+data.from.zip+'</ns4:codigoPostal>\
                              <ns4:colonia_Asentamiento>'+data.from.county+'</ns4:colonia_Asentamiento>\
                              <ns4:contacto>'+data.from.name+'</ns4:contacto>\
                              <ns4:email>'+data.from.email+'</ns4:email>\
                              <ns4:estado>'+data.from.state+'</ns4:estado>\
                              <ns4:numeroExterior>'+data.from.number+'</ns4:numeroExterior>\
                              <ns4:numeroInterior>'+fromInterior+'</ns4:numeroInterior>\
                              <ns4:telefonos>\
                                <ns4:telefono>'+data.from.phone+'</ns4:telefono>\
                              </ns4:telefonos>\
                              <ns4:pais>Mexico</ns4:pais>\
                            </ns4:remitente>\
                            <ns5:tipoEntrega xmlns:ns5="http://vo.redpack.com/xsd">\
                              <ns5:id>1</ns5:id>\
                            </ns5:tipoEntrega>\
                          </guias>\
                        </predocumentacion>\
                      </soapenv:Body>\
                    </soapenv:Envelope>';
                ship(body,function(result){
                  var services = [];
                  var jsonResponse = {
                    trackingNumber  : trackingNumber,
                    packages: []
                  };
                  convert.xmlDataToJSON(result).then(function (data) {
                      // console.log(data);
                      var res;
                      var returnEnvelope;
                      if(data['soapenv:Envelope']){
                          res = data['soapenv:Envelope'];
                          if(res['soapenv:Body']){
                              res = res['soapenv:Body'];
                              if(res[0] && res[0]['ns:predocumentacionResponse']){
                                  res = res[0]['ns:predocumentacionResponse'];
                                  if(res[0] && res[0]['ns:return']){
                                      res = res[0]['ns:return'];
                                      var returnEnvelope =  res;
                                      if(res[0] && res[0]['ax21:resultadoConsumoWS']){
                                          res = res[0]['ax21:resultadoConsumoWS'];
                                          if(res[0] && res[0]['ax21:estatus']){
                                              jsonResponse.status = res[0]['ax21:estatus'][0];
                                          }
                                          if(res[0] && res[0]['ax21:descripcion']){
                                              jsonResponse.descripcion = res[0]['ax21:descripcion'][0];
                                          }
        
                                      }
                                  }
                              }
                          }
                      }
                      console.log(res);
                      if(jsonResponse.status == "1"){
                        console.log('success');
                        // console.log(returnEnvelope[0]['ax21:paquetes']);
                        for(var i =0; i < returnEnvelope[0]['ax21:paquetes'].length ; i++){
                          var label = returnEnvelope[0]['ax21:paquetes'][i]['ax21:formatoEtiqueta'][0];
                          jsonResponse.packages.push({TrackingNumber: trackingNumber, label:label})
                        }
                      }
                      context.succeed(jsonResponse);
                  },function(err){
                      callback(err, null); 
                  });
                },function(error){
                    callback(error,null);
                });
            
          }else{
            callback("No se pudo obtener guia disponible",null);
          }
        },function(error){
          callback(error,null);
        });
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }   
};