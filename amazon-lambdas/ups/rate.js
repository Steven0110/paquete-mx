var https = require("https");
var moment = require("moment");


const production =  false;
const exchange = 20;
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

function currentService(result){
    var currentService = {};
    var defaultServices = {
      '01': 'UPS Next Day Air',
      '02': 'UPS Second Day Air',
      '03': 'UPS Ground',
      '07': 'UPS Worldwide Express',
      '08': 'UPS Worldwide Expedited',
      '11': 'UPS Standard',
      '12': 'UPS Three-Day Select',
      '13': 'UPS Next Day Air Saver',
      '14': 'UPS Next Day Air Early A.M.',
      '54': 'UPS Worldwide Express Plus',
      '59': 'UPS Second Day Air A.M.',
      '65': 'UPS Saver',
      '82': 'UPS Today Standard',
      '83': 'UPS Today Dedicated Courier',
      '84': 'UPS Today Intercity',
      '85': 'UPS Today Express',
      '86': 'UPS Today Express Saver',
      '92': 'UPS SurePost (USPS) < 1lb',
      '93': 'UPS SurePost (USPS) > 1lb',
      '94': 'UPS SurePost (USPS) BPM',
      '95': 'UPS SurePost (USPS) Media'
    }
    
    
    if(result.Service && result.Service.Code){
        currentService.code = result.Service.Code;
        
        currentService.name = defaultServices[currentService.code].toUpperCase();
        currentService.service = "ups";
        // currentService.name = result.Service.Code;
    }
    
    if(result.BillingWeight){
        if(result.BillingWeight.Weight)
            currentService.billingWeight = result.BillingWeight.Weight;
    }
    

    currentService.liveMode = production;

    if(result.TotalCharges){
        if(result.TotalCharges.MonetaryValue){
            var amount = parseFloat(result.TotalCharges.MonetaryValue);
            currentService.total = amount;
            currentService.orignalAmount = amount;
            currentService.currency = result.TotalCharges.CurrencyCode;
            if(currentService.currency && currentService.currency != "MXN"){
                currentService.total = (amount*exchange).toFixed(2);
                currentService.total = parseFloat(currentService.total);
            }
            // currentService.currency = result.TotalCharges;
            var total  = parseFloat(currentService.total);
            var discountTotal =  total*currentDiscount;
            discountTotal = (total-discountTotal).toFixed(2);
            currentService.discountTotal = parseFloat(discountTotal);
            // currentService.discountTotal = Math.ceil(parseFloat(discountTotal));
        }
    }
    
    if(result.NegotiatedRateCharges){
        if(result.NegotiatedRateCharges && result.NegotiatedRateCharges.TotalCharge)
        currentService.negotiated = result.NegotiatedRateCharges.TotalCharge.MonetaryValue;
    }
    
    currentService.result  = result;
    
    if(result.GuaranteedDelivery){
        if(result.GuaranteedDelivery.BusinessDaysInTransit){
            currentService.deliveryHours =  result.GuaranteedDelivery.BusinessDaysInTransit*24;
            if(currentService.code == "54")
                currentService.delivery      =  moment().add(result.GuaranteedDelivery.BusinessDaysInTransit,'day').format("YYYY-MM-DDT08:30:00");
            else if(currentService.code == "07")
                currentService.delivery      =  moment().add(result.GuaranteedDelivery.BusinessDaysInTransit,'day').format("YYYY-MM-DDT10:30:00");
            else
                currentService.delivery      =  moment().add(result.GuaranteedDelivery.BusinessDaysInTransit,'day').format("YYYY-MM-DDT21:00:00");
        }
    }
    
    return currentService;
}

var rateUPS = function(data,success,error){
    var headers = {
      'Content-Type': 'application/json',
    }

    var hostname = "wwwcie.ups.com";
    var path = '/rest/Rate';
    if(production){
      hostname =  "onlinetools.ups.com";
      path = '/rest/Rate'
    }


    var options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: headers
    };
    var req =   https.request(options, function(res) {
                    res.setEncoding('utf8');
                    var body ="";
                    res.on('data', function (result) {
                        body+=result;
                    });
                    res.on('end',function(){
                        success(body);
                    });
                    }).on('error', function(err) {
                        error(err);
                    });
    data = JSON.stringify(data);
    req.write(data);
    req.end();
}


exports.handler = (event, context, callback) => {
    var body ={};
    if(event){
        var data = event;
        var fromZip = false;
        var fromCountry =  false;
        var fromStateCode = false;
        var toZip = false;
        var toCountry =  false;
        var toStateCode = false;
        var packagingType = "02";
        var debugging = false;
        
        if(data.debugging){
            debugging = true;
        }
        
        if(data.type){
            if(data.type == "document"){
                packagingType = "02";    
            }else if(data.type == "package"){
                packagingType = "02";    
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
        
        if(data.from && data.from.stateCode){
            fromStateCode = data.from.stateCode.toUpperCase(); 
        }
        
        if(data.to && data.to.stateCode){
            toStateCode = data.to.stateCode.toUpperCase();
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
            var packages = [];
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
                    callback(generateError(400,"No legth value in package "+index+"."),null);
                    
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

                var json = {
                    "PackagingType": { 
                      "Code": packagingType, 
                      "Description": "Rate"
                    }, 
                    "Dimensions": {
                      "UnitOfMeasurement": { 
                        "Code": "cm", 
                        "Description": "centimetros"
                      },
                      "Length": dimensions.length, 
                      "Width": dimensions.width, 
                      "Height": dimensions.height
                    }, 
                    "PackageWeight": {
                      "UnitOfMeasurement": { 
                        "Code": "Kgs", 
                        "Description": "Kilogramos"
                      },
                      "Weight": dimensions.weight
                    }
                  };
                 if(item.valueDeclared && item.valueDeclared > 0){
                     json["PackageServiceOptions"] = {
                        "InsuredValue": {
                            "MonetaryValue": item.valueDeclared,
                            "CurrencyCode": "MXN"
                        }
                    };
                 }
                 console.log(json);
                packages.push(json);
                // callBack();
            })
        }else{
            callback(generateError(400,"We need at least 1 package dimensions."),null);
        }
        
        
        body = {
              "UPSSecurity": {
                "UsernameToken": {
                  "Username": "jc.canizal",
                  "Password": "Kernelpanic0923"
                },
                "ServiceAccessToken": {
                  "AccessLicenseNumber": "8D2F40C8969A08AC"
                }
              },
              "RateRequest": { 
                "Request": {
                  "RequestOption": "Shop"
                }, 
                "Shipment": {
                    "Shipper": {
                        "Name": "Carlos Canizal", 
                        "ShipperNumber": "979WR5", 
                        "Address": {
                            "PostalCode": "09770",
                            "CountryCode": "MX"
                        } 
                    },
                  "ShipTo": {
                    "Name": "José Canizal", 
                    "Address": {
                      "PostalCode": toZip, 
                      "CountryCode": toCountry
                    }
                  },
                  "ShipFrom": {
                    "Name": "Carlos Canizal", 
                    "Address": {
                      "PostalCode": fromZip,
                      "CountryCode": fromCountry
                    } 
                  },
                  "Package": packages, 
                  "ShipmentRatingOptions": {
                    "NegotiatedRatesIndicator": "" 
                  }
                }
              }
            };
        if(fromStateCode){
            body.RateRequest.Shipment.ShipFrom.Address.StateProvinceCode = fromStateCode;
        }
        
        if(toStateCode){
            body.RateRequest.Shipment.ShipTo.Address.StateProvinceCode = toStateCode;
        }
        
        rateUPS(body,function(result){
            console.log(result);
            var json ={
                services: [],
                totalServices: 0
            };
            result = JSON.parse(result);
            if(debugging){
                json.result = result;
            }
            if(result.RateResponse){
                if(result.RateResponse.RatedShipment){
                    var rated = result.RateResponse.RatedShipment;
                    if(Array.isArray(rated)){
                        IterateOver(rated,function(item){
                            json.services.push(currentService(item));
                            json.totalServices++;
                        })
                    }else{
                        json.services.push(currentService(rated));
                        json.totalServices++;
                    }
                    context.succeed(json);
                
                }else{
                    context.succeed(json);
                }
            }else{
                context.succeed(json);
            }
        });
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};