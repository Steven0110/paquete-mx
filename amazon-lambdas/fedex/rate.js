var https = require("https");
var convert = require('xml-to-json-promise');
var moment = require ('moment');
const production =  true;
const exchange = {"USD":20,"EUR":23};
const currentDiscount = 0.05;


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

var rate = function(data,success,error){
    var headers = {
      'Content-Type': 'application/xml',
    }

    var hostname = "wsbeta.fedex.com";
    var path = '/web-services'
    if(production){
      hostname =  "ws.fedex.com";
      path = '/web-services'
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
    var body ={};
    if(event){
        var data = event;
        var fromZip = false;
        var fromCountry = false;
        var toZip = false;
        var packagingType = "YOUR_PACKAGING";
        var toCountry =  false;
        var debugging = false;
        var services = [];
        
        if(data.debugging){
            debugging = true;
        }
        
        if(data.type){
            if(data.type == "document"){
                packagingType = "FEDEX_ENVELOPE";  
            }else if(data.type == "package"){
                packagingType = "YOUR_PACKAGING";    
            }else{
                context.fail(generateError(400,"packaging type invalid values accepted are 'document' or 'package'."));
            }
        }else{
            context.fail(generateError(400,"packaging type is required in from attribute."));
        }
        
        if(data.from && data.from.zip){
            fromZip = data.from.zip; 
            
        }else{
            context.fail(generateError(400,"zip value is required in from attribute."));
        }
        
        if(data.from && data.from.country){
            fromCountry = data.from.country.toUpperCase(); 
        }else{
            context.fail(generateError(400,"country value is required in from attribute."));
        }
        
        if(data.to && data.to.zip){
            toZip = data.to.zip;  
        }else{
            callback(generateError(400,"zip value is required in to attribute"),null);
        }
        
        if(data.to && data.to.country){
            toCountry = data.to.country.toUpperCase(); 
        }else{
            context.fail(generateError(400,"country value is required in to attribute."));
        }
        
        if(data.packages && data.packages.length > 0){
            var packages = "";
            var totalPackages = data.packages.length;
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
                
                packages += '<ns1:RequestedPackageLineItems><ns1:SequenceNumber>'+(index+1)+'</ns1:SequenceNumber><ns1:GroupPackageCount>1</ns1:GroupPackageCount><ns1:Weight><ns1:Units>KG</ns1:Units><ns1:Value>'+dimensions.weight+'</ns1:Value></ns1:Weight><ns1:Dimensions><ns1:Length>'+dimensions.length+'</ns1:Length><ns1:Width>'+dimensions.width+'</ns1:Width><ns1:Height>'+dimensions.height+'</ns1:Height><ns1:Units>CM</ns1:Units></ns1:Dimensions></ns1:RequestedPackageLineItems>';
                // callBack();
            });
        }else{
            callback(generateError(400,"We need at least 1 package dimensions."),null);
        }

        if(production){
          key = "raF7pWAdOFqh7RWp";
          password = "IpYuI9OM9zUIbTOZKg7mylyqo";
          accountNumber = "912197689";
          meterNumber = "111951423";
        }else{
          key = "t1uSywQP78fogZx4";
          password = "PGptLQ6OQHFjYkdKhDhoZjV15";
          accountNumber = "510087860";
          meterNumber = "118841995";
        }
        
        body = '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://fedex.com/ws/rate/v13"><SOAP-ENV:Body><ns1:RateRequest><ns1:WebAuthenticationDetail><ns1:UserCredential><ns1:Key>'+key+'</ns1:Key><ns1:Password>'+password+'</ns1:Password></ns1:UserCredential></ns1:WebAuthenticationDetail><ns1:ClientDetail><ns1:AccountNumber>'+accountNumber+'</ns1:AccountNumber><ns1:MeterNumber>'+meterNumber+'</ns1:MeterNumber></ns1:ClientDetail><ns1:TransactionDetail><ns1:CustomerTransactionId> *** Rate Request v13 using PHP ***</ns1:CustomerTransactionId></ns1:TransactionDetail><ns1:Version><ns1:ServiceId>crs</ns1:ServiceId><ns1:Major>13</ns1:Major><ns1:Intermediate>0</ns1:Intermediate><ns1:Minor>0</ns1:Minor></ns1:Version><ns1:ReturnTransitAndCommit>true</ns1:ReturnTransitAndCommit><ns1:RequestedShipment><ns1:DropoffType>REGULAR_PICKUP</ns1:DropoffType><ns1:PackagingType>'+ packagingType+'</ns1:PackagingType><ns1:PreferredCurrency>MXN</ns1:PreferredCurrency><ns1:Shipper><ns1:Contact><ns1:PersonName>Sender Name</ns1:PersonName><ns1:CompanyName>Sender Company Name</ns1:CompanyName><ns1:PhoneNumber></ns1:PhoneNumber></ns1:Contact><ns1:Address><ns1:StreetLines></ns1:StreetLines><ns1:City></ns1:City><ns1:StateOrProvinceCode></ns1:StateOrProvinceCode><ns1:PostalCode>'+fromZip+'</ns1:PostalCode><ns1:CountryCode>'+fromCountry+'</ns1:CountryCode></ns1:Address></ns1:Shipper><ns1:Recipient><ns1:Contact><ns1:PersonName>Recipient Name</ns1:PersonName><ns1:CompanyName>Company Name</ns1:CompanyName><ns1:PhoneNumber></ns1:PhoneNumber></ns1:Contact><ns1:Address><ns1:StreetLines></ns1:StreetLines><ns1:City></ns1:City><ns1:StateOrProvinceCode></ns1:StateOrProvinceCode><ns1:PostalCode>'+toZip+'</ns1:PostalCode><ns1:CountryCode>'+toCountry+'</ns1:CountryCode><ns1:Residential>false</ns1:Residential></ns1:Address></ns1:Recipient><ns1:ShippingChargesPayment><ns1:PaymentType>SENDER</ns1:PaymentType><ns1:Payor><ns1:ResponsibleParty><ns1:AccountNumber>'+accountNumber+'</ns1:AccountNumber></ns1:ResponsibleParty></ns1:Payor></ns1:ShippingChargesPayment><ns1:RateRequestTypes>ACCOUNT</ns1:RateRequestTypes><ns1:PackageCount>'+totalPackages+'</ns1:PackageCount>'+packages+'</ns1:RequestedShipment></ns1:RateRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>';
        
        
        rate(body,function(result){
            // result = JSON.parse(result);
            convert.xmlDataToJSON(result).then(function (data) {
                if(data["SOAP-ENV:Envelope"]){
                    data =  data["SOAP-ENV:Envelope"];
                    if(data["SOAP-ENV:Body"]){
                        data = data["SOAP-ENV:Body"][0];
                        if(data["RateReply"]){
                            data = data["RateReply"][0];
                            if(data["RateReplyDetails"]){
                                data = data["RateReplyDetails"];
                                IterateOver(data,function(item, index){
                                    // var item = data[0];
                                    var json = {};
                                    if(item["ServiceType"]){
                                        json.code = item["ServiceType"][0];
                                        json.name = json.code.replace(/_/g,' ');
                                        json.service = "fedex";
                                    }
                                    
                                    if(item["DeliveryTimestamp"]){
                                        json.delivery = item["DeliveryTimestamp"][0];
                                        var now  = moment();
                                        var then = json.delivery;
                                        var ms = moment(then,"YYYY/MM/DDTHH:mm:ss").diff(moment());
                                        var d = moment.duration(ms);
                                        var hours = (d.days()*24)+d.hours();
                                        json.deliveryHours = hours;
                                    }else{
                                        var hours = 144;
                                        json.deliveryHours = hours;
                                    }
                                    
                                    if(item["RatedShipmentDetails"]){
                                        if(item["RatedShipmentDetails"][0]["ShipmentRateDetail"]){
                                            if(item["RatedShipmentDetails"][0]["ShipmentRateDetail"][0]["TotalBillingWeight"]){
                                                if(item["RatedShipmentDetails"][0]["ShipmentRateDetail"][0]["TotalBillingWeight"][0]["Value"]){
                                                    json.billingWeight = item["RatedShipmentDetails"][0]["ShipmentRateDetail"][0]["TotalBillingWeight"][0]["Value"][0];        
                                                }
                                            }
                                        }
                                            
                                    }
                                    
                                    if(item["RatedShipmentDetails"] && item["RatedShipmentDetails"][1] ){
                                        if(item["RatedShipmentDetails"][1]["ShipmentRateDetail"]){
                                            if(item["RatedShipmentDetails"][1]["ShipmentRateDetail"][0]["TotalBaseCharge"]){
                                                if(item["RatedShipmentDetails"][1]["ShipmentRateDetail"][0]["TotalBaseCharge"][0]["Amount"]){
                                                    json.total = item["RatedShipmentDetails"][1]["ShipmentRateDetail"][0]["TotalBaseCharge"][0]["Amount"][0];        
                                                    json.total = parseFloat(json.total).toFixed(2);
                                                    json.currency = item["RatedShipmentDetails"][1]["ShipmentRateDetail"][0]["TotalBaseCharge"][0]["Currency"][0];

                                                    if(json.currency && json.currency != "NMP"){

                                                        var currencyCode = "USD";
                                                        if(json.currency == "EUR"){
                                                            currencyCode = "EUR"
                                                        }


                                                        json.total = (json.total*exchange[currencyCode]).toFixed(2);
                                                        json.total = parseFloat(json.total);
                                                    }


                                                    //algoritmo agregado por peticion de Bogar Muñoz
                                                    //total + 31%
                                                    json.originalAmount = json.total;
                                                    var total = parseFloat((json.originalAmount*(1.31)).toFixed(2));
                                                    json.total =  total;

                                                    var initialDiscount = (json.originalAmount*0.02);
                                                    initialDiscount = json.originalAmount - initialDiscount;
                                                    initialDiscount = parseFloat((initialDiscount*(1.05)).toFixed(2));
                                                    initialDiscount = parseFloat((initialDiscount*(1.16)).toFixed(2));
                                                    json.discountTotal = initialDiscount;
                                                    json.negotiated = total;
                                                    //algoritmo agregado por peticion de Bogar Muñoz

                                                    //VERSION ANTERIOR
                                                    // json.originalAmount = json.total;
                                                    // var discount = json.total*currentDiscount;
                                                    // json.discountTotal = json.total-discount;
                                                    // json.negotiated = json.total;
                                                    //VERSION ANTERIOR
                                                }
                                            }
                                        }
                                            
                                    }
                                    services.push(json);
                                });
                            };
                        }
                    }
                }
                
                var response = {
                    services:services,
                    // services:[],
                    totalServices:services.length
                }
                
                if(debugging){
                    response.result = data;
                }

                // console.log(response);
                context.succeed(response);
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