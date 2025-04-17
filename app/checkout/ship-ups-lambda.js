var https = require("https");

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
                
                var json = {
                    "Packaging": { 
                      "Code": "02", 
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
                      "Name": "Shipper Name",
                      "AttentionName": "Shipper Attn Name",
                      "TaxIdentificationNumber": "123456",
                      "Phone": {
                        "Number": "1234567890",
                        "Extension": "1"
                      },
                      "ShipperNumber": "979WR5",
                      "FaxNumber": "1234567890",
                      "Address": {
                        "AddressLine": "Hamburgo 70, 201",
                        "City": "Cuauhtemoc",
                        "StateProvinceCode": "09",
                        "PostalCode": "06600",
                        "CountryCode": "MX"
                      }
                    },
                    "ShipTo": {
                      "Name": "Carlos Canizal",
                      "AttentionName": "Carlos Canizal",
                      "Phone": {
                        "Number": "5535068102"
                      },
                      "Address": {
                        "AddressLine": "Av. Juarez #32 interior 305",
                        "City": "Cuauhtemoc",
                        "StateProvinceCode": "09",
                        "PostalCode": "06010",
                        "CountryCode": "MX"
                      }
                    },
                    "ShipFrom": {
                      "Name": "Carlos Canizal",
                      "AttentionName": "Carlos Canizal",
                      "Phone": {
                        "Number": "5535068102"
                      },
                      "Address": {
                        "AddressLine": "Hamburgo 70 - 102",
                        "City": "Cuauhtemoc",
                        "StateProvinceCode": "09",
                        "PostalCode": "06600",
                        "CountryCode": "MX"
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
                      "Code": "01",
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
            var json = {}
            result = JSON.parse(result);
            if(debugging){
                json.result = result;
            }

            // if(result.result){
            //   result = result.result;
            //   if(result.ShipmentResults){
            //     result = result.ShipmentResults;
            //   }
            // }
            
            context.succeed(result);
            
        });
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};