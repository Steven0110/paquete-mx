var https = require("https");
var convert = require('xml-to-json-promise');
var moment = require ('moment');
const production =  false;


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

var pickup = function(data,success,error){
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
    if(event){
        var data = event;
        

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

        console.log(data);
        var pickUpDate = "";
        if(data.date){
            var date = data.date.split('-');
            if(date[0]){
                pickUpDate += date[0]+"-";
            }else{
                var err= generateError(400,"Invalid date format YYYY-MM-DD Year");
                context.fail(err);
            }
            // 2018-01-17T15:00:00
            
            if(date[1]){
                pickUpDate += date[1]+"-";
            }else{
                var err= generateError(400,"Invalid date format YYYY-MM-DD Month");
                context.fail(err);
            }
            
            if(date[2]){
                pickUpDate += date[2];
            }else{
                var err= generateError(400,"Invalid date format YYYY-MM-DD Day");
                context.fail(err);
            }
        }else{
            var err= generateError(400,"Invalid date format YYYY-MM-DD");
            context.fail(err);
        }
        
        var startDay;
        if(data.start){
            // startDay = data.start.replace(":","");
            pickUpDate += "T"+data.start+":00";
        }else{
            var err= generateError(400,"start time is required HH:mm");
            context.fail(err);
        }
        
        var endDay;
        if(data.end){
            endDay = data.end+":00";
        }else{
            var err= generateError(400,"end time is required HH:mm");
            context.fail(err);
        }

        var serviceCode = false;
        if(data.serviceCode){
            serviceCode = data.serviceCode;
        }else{
            var err= generateError(400,"seviceCode is required");
            context.fail(err);
        }
        
        var packages = [];
        var PackageCount;
        var TotalWeight = 0;
        if(data.packages){
            var PackageCount = data.packages.length;
            for(var i=0; i< data.packages.length; i++){
                var item = data.packages[i];
                TotalWeight  += item.weight;
            }
        }else{
            var err= generateError(400,"packages are required");
            context.fail(err);
        }
        
        var from= {};
        if(data.from){
            from = data.from;
        }else{
            var err= generateError(400,"from object is required");
            context.fail(err);
        }
        
        var to = {};
        if(data.to){
            to = data.to;
        }else{
            var err= generateError(400,"to object is required");
            context.fail(err);
        }

        var PersonName = data.from.name;
        var CompanyName = data.from.name;

        if(data.from.company){
            CompanyName = data.from.company;
        }

        var PhoneNumber =  data.from.phone;
        var Street = data.from.street;
        var PickUpNumber = data.from.number;

        if(data.from.apt){
            PickUpNumber += " "+data.from.apt;
        }

        var City =  data.from.city;
        var State =  data.from.state;
        var PostalCode =  data.from.zip;
        var CountryCode =  data.from.country.code;
        
        var body = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v9="http://fedex.com/ws/pickup/v9"><soapenv:Header /><soapenv:Body><v9:CreatePickupRequest><v9:WebAuthenticationDetail><v9:UserCredential><v9:Key>'+key+'</v9:Key><v9:Password>'+password+'</v9:Password></v9:UserCredential></v9:WebAuthenticationDetail><v9:ClientDetail><v9:AccountNumber>'+accountNumber+'</v9:AccountNumber><v9:MeterNumber>'+meterNumber+'</v9:MeterNumber><v9:IntegratorId>12345</v9:IntegratorId><v9:Localization><v9:LanguageCode>ES</v9:LanguageCode><v9:LocaleCode>ES</v9:LocaleCode></v9:Localization></v9:ClientDetail><v9:TransactionDetail><v9:CustomerTransactionId>CreatePickupRequest_v9</v9:CustomerTransactionId><v9:Localization><v9:LanguageCode>ES</v9:LanguageCode><v9:LocaleCode>ES</v9:LocaleCode></v9:Localization></v9:TransactionDetail><v9:Version><v9:ServiceId>disp</v9:ServiceId><v9:Major>9</v9:Major><v9:Intermediate>0</v9:Intermediate><v9:Minor>0</v9:Minor></v9:Version><v9:AssociatedAccountNumber><v9:Type>FEDEX_EXPRESS</v9:Type><v9:AccountNumber>'+accountNumber+'</v9:AccountNumber></v9:AssociatedAccountNumber><v9:OriginDetail><v9:PickupLocation><v9:Contact><v9:PersonName>'+PersonName+'</v9:PersonName><v9:CompanyName>'+CompanyName+'</v9:CompanyName><v9:PhoneNumber>'+PhoneNumber+'</v9:PhoneNumber></v9:Contact><v9:Address><v9:StreetLines>'+Street+'</v9:StreetLines><v9:StreetLines>'+PickUpNumber+'</v9:StreetLines><v9:City>'+City+'</v9:City><v9:StateOrProvinceCode>'+State+'</v9:StateOrProvinceCode><v9:PostalCode>'+PostalCode+'</v9:PostalCode><v9:CountryCode>'+CountryCode+'</v9:CountryCode></v9:Address></v9:PickupLocation><v9:ReadyTimestamp>'+pickUpDate+'</v9:ReadyTimestamp><v9:CompanyCloseTime>'+endDay+'</v9:CompanyCloseTime></v9:OriginDetail><v9:PackageCount>'+PackageCount+'</v9:PackageCount><v9:TotalWeight><v9:Units>KG</v9:Units><v9:Value>'+TotalWeight+'</v9:Value></v9:TotalWeight><v9:CarrierCode>FDXE</v9:CarrierCode><v9:CountryRelationship>DOMESTIC</v9:CountryRelationship></v9:CreatePickupRequest></soapenv:Body></soapenv:Envelope>';
        
        
        pickup(body,function(result){
            // console.log(result);
            convert.xmlDataToJSON(result).then(function (data) {
                console.log(data);
                var real =data;
                if(data["SOAP-ENV:Envelope"]){
                    data = data["SOAP-ENV:Envelope"];
                    if(data["SOAP-ENV:Body"]){
                        data = data["SOAP-ENV:Body"][0];
                        if(data['CreatePickupReply']){
                            data = data['CreatePickupReply'][0];
                            var status = false;
                            var confirmation = false;
                            if(data['HighestSeverity']){
                                status = data['HighestSeverity'][0]
                            }
                            if(data['PickupConfirmationNumber']){
                                confirmation = data['PickupConfirmationNumber'][0]
                            }

                            if(status == "SUCCESS" && confirmation){
                                data = {confirmation: confirmation};
                                context.succeed(data);
                            }else{

                                var message = null;
                                if(data["Notifications"]){
                                    data = data["Notifications"][0];
                                    if(data["Message"]){
                                        message = data["Message"][0];
                                    }
                                }
                                data = generateError(400, message);
                                context.fail(data);
                            }
                        }
                    }
                }
                context.succeed(real);
            },function(err){
                callback(err, null); 
            })
        },function(err){
            callback(err, null); 
        });
        
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};