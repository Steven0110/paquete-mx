var https = require("https");
const production = false;

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
    var headers = {
      'Content-Type': 'application/json',
    }

    var hostname = "wwwcie.ups.com";
    var path = '/rest/Ship'
    if(production){
      hostname =  "onlinetools.ups.com/rest/Ship";
      path = '/rest/Ship'
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
        
        var debugging = false;
        
        if(data.debugging){
            debugging = true;
        }
        
        if(data.service){
          if(!data.service.code){
            context.fail(generateError(400,"service code is required in service attribute."));  
          }
        }else{
          context.fail(generateError(400,"ups service data is required."));
        }
        var packagingType = "02";
        if(data.packagingType){
            if(data.packagingType == "document"){
                packagingType = "01";    
            }else if(data.packagingType == "package"){
                packagingType = "02";    
            }else{
                context.fail(generateError(400,"packaging type invalid values accepted are 'document' or 'package'."));
            }
        }else{
          context.fail(generateError(400,"packagingType data is required."));
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
          if(!data.from.apt){
            context.fail(generateError(400,"apt value is required in from attribute."));
          }
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
          if(!data.to.apt){
            context.fail(generateError(400,"apt value is required in to attribute."));
          }
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
                console.log(data.to);
                var json = {
                    "Packaging": { 
                      "Code": packagingType,
                      "Description": "Rate"
                    }, 
                    "Dimensions": {
                      "UnitOfMeasurement": { 
                        "Code": "CM", 
                        "Description": "centimetros"
                      },
                      "Length": dimensions.length, 
                      "Width": dimensions.width, 
                      "Height": dimensions.height
                    }, 
                    "PackageWeight": {
                      "UnitOfMeasurement": { 
                        "Code": "KGS", 
                        "Description": "Kilogramos"
                      },
                      "Weight": dimensions.weight 
                    }
                  };
                packages.push(json);
                // callBack();
            })
        }else{
            callback(generateError(400,"We need at least 1 package dimensions."),null);
        }
        
        var fromAddress = data.from.street+" "+data.from.number;
        if(data.from.apt){
          fromAddress += " "+data.from.apt;
        }

        var toAddress = data.to.street+" "+data.to.number;
        if(data.to.apt){
          toAddress += " "+data.to.apt;
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
                "ShipmentRequest": {
                  "Request": {
                    "RequestOption": "validate",
                    "TransactionReference": {
                      "CustomerContext": "Your Customer Context"
                    }
                  },
                  "Shipment": {
                    "Description": "Description",
                    "Shipper": {
                      "Name": data.from.name,
                      "Phone": {
                        "Number": data.from.phone
                      },
                      "ShipperNumber": "979WR5",
                      "Address": {
                        "AddressLine": fromAddress,
                        "City": data.from.city,
                        "PostalCode": data.from.zip,
                        "CountryCode": data.from.country.code
                      }
                    },
                    "ShipTo": {
                      "Name": data.to.name,
                      "Phone": {
                        "Number": data.to.phone
                      },
                      "Address": {
                        "AddressLine": toAddress,
                        "City": data.to.city,
                        "PostalCode": data.to.zip,
                        "CountryCode": data.to.country.code
                      }
                    },
                    "ShipFrom": {
                      "Name": data.from.name,
                      "Phone": {
                        "Number": data.from.phone
                      },
                      "Address": {
                        "AddressLine": fromAddress,
                        "City": data.from.city,
                        "PostalCode": data.from.zip,
                        "CountryCode": data.from.country.code
                      }
                    },
                    "PaymentInformation": {
                      "ShipmentCharge": {
                        "Type": "01",
                        "BillShipper": {
                          "AccountNumber":"979WR5"
                        }
                      }
                    },
                    "Service": {
                      "Code": data.service.code,
                      "Description": "Express"
                    },
                    "Package": packages 
                    },
                    "LabelSpecification": {
                      "LabelImageFormat": {
                        "Code": "GIF",
                        "Description": "GIF"
                      },
                      "HTTPUserAgent": "Mozilla/4.5"
                    }
                  }
                };

        
        
        ship(body,function(result){
            var json = {};
            result = JSON.parse(result);
            if(debugging){
                json.result = result;
            }

            if(result.ShipmentResponse){
                result = result.ShipmentResponse;
                if(result.ShipmentResults){
                    result = result.ShipmentResults;
                    var charges = {};
                    if(result.ShipmentCharges){
                        charges = result.ShipmentCharges;
                        if(charges.TotalCharges){
                            json.total ={};
                            if(charges.TotalCharges.CurrencyCode){
                                json.total.currency = charges.TotalCharges.CurrencyCode;
                            }
                            if(charges.TotalCharges.MonetaryValue){
                                json.total.value = charges.TotalCharges.MonetaryValue;
                            }
                        }
                    }
                    
                    if(result.NegotiatedRateCharges && result.NegotiatedRateCharges.TotalCharge){
                        json.negotiated ={};
                        charges =  result.NegotiatedRateCharges.TotalCharge;
                        if(charges.CurrencyCode){
                            json.negotiated.currency = charges.CurrencyCode;
                        }
                        
                        if(charges.MonetaryValue){
                            json.negotiated.value = charges.MonetaryValue;
                        }
                    }
                    
                    if(result.ShipmentIdentificationNumber){
                        json.trackingNumber = result.ShipmentIdentificationNumber;
                    }
                    
                    var packages =  [];
                    
                    if(result.PackageResults && result.PackageResults.ShippingLabel){
                        packages.push(result.PackageResults);
                    }else if(result.PackageResults.length > 0){
                        packages = result.PackageResults;
                    }
                }
            }
            json.packages = [];
            IterateOver(packages,function(item, index){
                var package = {};
                    if(item.TrackingNumber)
                        package.TrackingNumber = item.TrackingNumber;
                    if(item.ShippingLabel && item.ShippingLabel.GraphicImage){
                        package.label = item.ShippingLabel.GraphicImage;
                    }
                json.packages.push(package);
            });
            
            context.succeed(json);
            
        });
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};