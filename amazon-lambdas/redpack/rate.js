var https = require("http");
var convert = require('xml-to-json-promise');
var moment = require('moment');
const production =  true;
var totalBruto;
var totalVolumetrico;


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

function generateError(code, message){
    return JSON.stringify({"status":code,"error":message});
}

var rate = function(data,success,error){
    var headers = {
      'Content-Type': 'text/xml',
    }

    var hostname = "ws.redpack.com.mx";
    var path = '/RedpackAPI_WS/services/RedpackWS?wsdl'
    if(production){
      hostname =  "ws.redpack.com.mx";
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
    
    var body ="";
    var currentDiscount = 0.40;
    if(event){
        var data = event;
        var fromZip = false;
        var toZip = false;

        var fromState = false;
        var toState = false;
        var debugging = false;
        
        if(data.debugging){
            debugging = true;
        }
        
        if(data.from && data.from.zip){
            fromZip = data.from.zip; 
        }else{
            context.fail(generateError(400,"zip value is required in from attribute."));
        }
        
        if(data.to && data.to.zip){
            toZip = data.to.zip;  
        }else{
            callback(generateError(400,"zip value is required in to attribute"),null);
        }

        fromState = data.from.stateCode;
        toState = data.to.stateCode;

        console.log(fromState);
        console.log(toState);
        
        
        if(data.packages && data.packages.length > 0){
            var packages = "";
            var aux =[];
            var limit =  data.packages.length;
            var start = 4;
            totalBruto = 0;
            totalVolumetrico = 0;
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
                    totalBruto += parseFloat(item.weight);
                }else{
                    callback(generateError(400,"No weight value in package "+index+"."),null);
                }
                
                
                if(dimensions.length && dimensions.width && dimensions.height){
                    totalVolumetrico += parseFloat(((dimensions.length*dimensions.width*dimensions.height)/5000).toFixed(2));
                }
                
                // packages += '<ns'+(index+start)+':paquetes xmlns:ns'+(index+start)+'="http://vo.redpack.com/xsd"><ns'+(index+1)+':alto>'+dimensions.height+'</ns'+(index+1)+':alto><ns'+(index+1)+':ancho>'+dimensions.width+'</ns'+(index+1)+':ancho><ns'+(index+1)+':largo>'+dimensions.length+'</ns'+(index+1)+':largo><ns'+(index+1)+':peso>'+dimensions.weight+'</ns'+(index+1)+':peso></ns'+(index+1)+':paquetes>';
                packages += '<ns'+(index+start)+':paquetes xmlns:ns'+(index+start)+'="http://vo.redpack.com/xsd"><ns'+(index+start)+':alto>'+dimensions.height+'</ns'+(index+start)+':alto><ns'+(index+start)+':ancho>'+dimensions.width+'</ns'+(index+start)+':ancho><ns'+(index+start)+':largo>'+dimensions.length+'</ns'+(index+start)+':largo><ns'+(index+start)+':peso>'+dimensions.weight+'</ns'+(index+start)+':peso></ns'+(index+start)+':paquetes>';
                
                aux.push(packages);
                // callBack();
            });
        }else{
            callback(generateError(400,"We need at least 1 package dimensions."),null);
        }
        
        
        
        
        var pin = "QA j54/PyzkOAeMZzGPNFBpP/y8thMFFdZfbqZTWYQ8sjw=";
        if(production){
            "PROD j54/PyzkOAeMZzGPNFBpP/y8thMFFdZfbqZTWYQ8sjw=";
        }
        var idUsuario = "785";
        body ='<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><cotizacionNacional xmlns="http://ws.redpack.com"><PIN>'+pin+'</PIN><idUsuario>'+idUsuario+'</idUsuario><guias><ns1:consignatario xmlns:ns1="http://vo.redpack.com/xsd"><ns1:codigoPostal>'+fromZip+'</ns1:codigoPostal></ns1:consignatario><ns2:remitente xmlns:ns2="http://vo.redpack.com/xsd"><ns2:codigoPostal>'+toZip+'</ns2:codigoPostal></ns2:remitente><ns3:tipoEntrega xmlns:ns3="http://vo.redpack.com/xsd"><ns3:id>1</ns3:id></ns3:tipoEntrega>'+packages+'</guias></cotizacionNacional></soapenv:Body></soapenv:Envelope>';
        
        rate(body,function(result){
            // console.log(result);
            // result = JSON.parse(result);
            var services = [];
            
            convert.xmlDataToJSON(result).then(function (data) {
                
                if(data["soapenv:Envelope"]){
                    data = data["soapenv:Envelope"];
                    if(data["soapenv:Body"]){
                        data = data["soapenv:Body"];
                        if(data[0] && data[0]["ns:cotizacionNacionalResponse"]){
                            data = data[0]["ns:cotizacionNacionalResponse"];
                            if(data[0] && data[0]["ns:return"]){
                                data = data[0]["ns:return"];
                                if(data[0] && data[0]["ax21:cotizaciones"]){
                                    data = data[0]["ax21:cotizaciones"];
                                    
                                    IterateOver(data,function(item, index){
                                        var json ={};
                                        if(item && item["ax21:tiempoEntrega"]){
                                            json.delivery = item["ax21:tiempoEntrega"][0];
                                        }
                                        
                                        if(item && item["ax21:tipoServicio"]){
                                            var service = item["ax21:tipoServicio"];
                                            if(service[0] && service[0]["ax21:descripcion"]){
                                                json.code = service[0]["ax21:id"][0];
                                                json.name = service[0]["ax21:descripcion"][0];
                                                json.service = "redpack";
                                            }
                                        }
                                        

                                        if(item && item["ax21:detallesCotizacion"]){
                                            var price = item["ax21:detallesCotizacion"];
                                            if(price[3] && price[3]["ax21:costoBase"] && price[3]["ax21:costoBase"][0]){
                                                json.total = price[3]["ax21:costoBase"][0];
                                                json.total = parseFloat(json.total).toFixed(2);
                                                json.negotiated = json.total;
                                            }
                                        }
                                        
                                        if(item["ax21:tarifa"] && item["ax21:tarifa"][0]){
                                            json.total = item["ax21:tarifa"][0];
                                            json.negotiated = json.total;
                                        }
                                        
                                        if(json.total){
                                            var discountTotal;
                                            var realWeight = totalBruto > totalVolumetrico? totalBruto : totalVolumetrico;
                                            if(json.name == "METROPOLITANO"){
                                                // discountTotal  =json.total * 0.20;
                                                // discountTotal  = (json.total-discountTotal).toFixed(2);
                                                // discountTotal = parseFloat(discountTotal);
                                                json = false;
                                            }
                                            else if(json.name == "EXPRESS"){

                                              var table = require("states.json");


                                                  if(fromState != "DIF" && toState != "DIF"){
                                                    var total = json.total * 1.16;
                                                    json.total = total;
                                                    discountTotal  =  total*0.025;
                                                    discountTotal  = (total-discountTotal).toFixed(2);
                                                    discountTotal = parseFloat(discountTotal);

                                                  }else if(fromState == "DIF" && toState == "DIF"){
                                                    json =  false;
                                                  }else{
                                                    var state = false;
                                                    if(fromState != "DIF")
                                                      state = fromState;
                                                    else
                                                      state = toState;


                                                    console.log(state);
                                                    realWeight =  Math.ceil(realWeight);

                                                    realWeight = realWeight.toString();
                                                    if(table[state] && table[state][realWeight]){
                                                      json.total = (table[state][realWeight].original)+40;
                                                      discountTotal = table[state][realWeight].paquete;
                                                    }else{
                                                      json = false;
                                                    }




                                                  }
                                            }
                                            else if(json.name == "ECOEXPRESS"){
                                              var base = false;
                                                var ecoexpress = [
                                                  {weitgh:"0-5", paquetePrice:   155,price:217, discount: 62.00},
                                                  {weitgh:"6-9", paquetePrice:   180.06,price:252.08, discount: 72.02},
                                                  {weitgh:"10-14", paquetePrice: 232.46,price:325.44, discount: 92.98},
                                                  {weitgh:"15-20", paquetePrice: 273.13,price:382.38, discount: 109.25},
                                                  {weitgh:"21-25", paquetePrice: 343.78,price:481.29, discount: 137.51},
                                                  {weitgh:"26-30", paquetePrice: 381.43,price:534.01, discount: 152.57},
                                                  {weitgh:"31-35", paquetePrice: 445.28,price:623.40, discount: 178.11},
                                                  {weitgh:"36-40", paquetePrice: 491.13,price:687.58, discount: 196.45},
                                                  {weitgh:"41-50", paquetePrice: 597.53,price:836.54, discount: 239.01},
                                                  {weitgh:"51-60", paquetePrice: 700.66,price:980.93, discount: 280.26},
                                                  {weitgh:"61-70", paquetePrice: 816.90,price:1143.66, discount: 326.76}
                                                ];

                                                realWeight =  Math.ceil(realWeight);

                                                if(realWeight <= 5){
                                                  base = ecoexpress[0]
                                                }else if(realWeight > 5 && realWeight <= 9){
                                                  base = ecoexpress[1]
                                                }else if(realWeight > 9 && realWeight <= 14){
                                                  base = ecoexpress[2]
                                                }else if(realWeight > 14 && realWeight <= 20){
                                                  base = ecoexpress[3]
                                                }else if(realWeight > 20 && realWeight <= 25){
                                                  base = ecoexpress[4]
                                                }else if(realWeight > 25 && realWeight <= 30){
                                                  base = ecoexpress[5]
                                                }else if(realWeight > 30 && realWeight <= 35){
                                                  base = ecoexpress[6]
                                                }else if(realWeight > 35 && realWeight <= 40){
                                                  base = ecoexpress[7]
                                                }else if(realWeight > 40 && realWeight <= 50){
                                                  base = ecoexpress[8]
                                                }else if(realWeight > 50 && realWeight <= 60){
                                                  base = ecoexpress[9]
                                                }else if(realWeight > 60 && realWeight <= 70){
                                                  base = ecoexpress[10]
                                                }

                                                if(base){
                                                  json.total = base.price;
                                                  discountTotal  = base.paquetePrice;
                                                }else{
                                                  json = false;
                                                }

                                            }
                                            else{
                                                // var base =0;
                                                // if(realWeight <= 5){
                                                //     base = (80*1.80).toFixed(2);
                                                // }else if(realWeight > 5 && realWeight <= 9){
                                                //     base = (110*1.60).toFixed(2);
                                                // }else if(realWeight > 9 && realWeight <= 14){
                                                //     base = (142*1.60).toFixed(2);
                                                // }else if(realWeight > 14 && realWeight <= 20){
                                                //     base = (167*1.60).toFixed(2);
                                                // }else if(realWeight > 20 && realWeight <= 25){
                                                //     base = (210*1.60).toFixed(2);
                                                // }else if(realWeight > 25 && realWeight <= 30){
                                                //     base = (233*1.60).toFixed(2);
                                                // }else if(realWeight > 30 && realWeight <= 35){
                                                //     base = (272*1.60).toFixed(2);
                                                // }else if(realWeight > 35 && realWeight <= 40){
                                                //     base = (300*1.60).toFixed(2);
                                                // }else if(realWeight > 40 && realWeight <= 50){
                                                //     base = (365*1.60).toFixed(2);
                                                // }else if(realWeight > 50 && realWeight <= 60){
                                                //     base = (428*1.60).toFixed(2);
                                                // }else if(realWeight > 60 && realWeight <= 70){
                                                //     base = (499*1.60).toFixed(2);
                                                // }
                                                
                                                // discountTotal = parseFloat(base);
                                                
                                                discountTotal  =json.total * 0.20;
                                                discountTotal  = (json.total-discountTotal).toFixed(2);
                                                discountTotal = parseFloat(discountTotal);
                                                

                                                // discountTotal =  json.total*currentDiscount;
                                                // discountTotal = json.total-discountTotal;
                                            }
                                            json.discountTotal = Math.ceil(discountTotal);
                                        }
                                        
                                        if(json.delivery){
                                            // var now  = moment();
                                            // var then = json.delivery;
                                            // var ms = moment(then,"YYYY/MM/DD").diff(now);
                                            // var d = moment.duration(ms);
                                            
                                            // var hours = (d.days()*24)+d.hours();
                                            // json.deliveryHours = hours;
                                            
                                            var date1 = moment().subtract(6,"hours");
                                            var date2 = moment(json.delivery);
                                            
                                            var differenceInMs = date2.diff(date1);
                                            var duration = moment.duration(differenceInMs);
                                            var differenceInMinutes = duration.asMinutes();
                                            var hours = Math.ceil(differenceInMinutes/60);
                                            json.deliveryHours = hours;
                                        }
                                        
                                        if(json !== false)
                                          services.push(json);
                                    
                                    });
                                }
                            }
                        }
                    }
                }
                
                var jsonResponse = {
                    services: services,
                    totalServices: services.length
                }
                
                if(debugging){
                    jsonResponse.result =  data;
                }
                context.succeed(jsonResponse);
                // context.succeed({services:services,totalServices:services.length,result:data});
            },function(err){
                // err = JSON.parse(err);
                callback(err, null); 
            });
        },function(error){
            callback(error,null);
        });
        
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};