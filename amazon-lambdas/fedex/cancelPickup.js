var https = require("https");
var convert = require('xml-to-json-promise');
var moment = require ('moment');
const production =  true;


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
    var path = '/web-services/pickup'
    if(production){
      hostname =  "ws.fedex.com";
      path = '/web-services/pickup'
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

        var PickupConfirmationNumber;

        if(data.pickupConfirmation){
            PickupConfirmationNumber = data.pickupConfirmation;
        }else{
            var err= generateError(400,"pickupConfirmation is required");
            context.fail(err);
        }

        var date = moment(new Date()).subtract(6,'hours').add(1,'days').format("YYYY-MM-DD");
        var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v9="http://fedex.com/ws/pickup/v9"><soapenv:Header/><soapenv:Body><v9:CancelPickupRequest><v9:WebAuthenticationDetail><v9:UserCredential><v9:Key>'+key+'</v9:Key><v9:Password>'+password+'</v9:Password></v9:UserCredential></v9:WebAuthenticationDetail><v9:ClientDetail><v9:AccountNumber>'+accountNumber+'</v9:AccountNumber><v9:MeterNumber>'+meterNumber+'</v9:MeterNumber><v9:Localization><v9:LanguageCode>ES</v9:LanguageCode><v9:LocaleCode>ES</v9:LocaleCode></v9:Localization></v9:ClientDetail><v9:TransactionDetail><v9:CustomerTransactionId>CancelPickupRequest_v9</v9:CustomerTransactionId><v9:Localization><v9:LanguageCode>ES</v9:LanguageCode><v9:LocaleCode>ES</v9:LocaleCode></v9:Localization></v9:TransactionDetail><v9:Version><v9:ServiceId>disp</v9:ServiceId><v9:Major>9</v9:Major><v9:Intermediate>0</v9:Intermediate><v9:Minor>0</v9:Minor></v9:Version><v9:CarrierCode>FDXE</v9:CarrierCode><v9:PickupConfirmationNumber>'+PickupConfirmationNumber+'</v9:PickupConfirmationNumber><v9:ScheduledDate>'+date+'</v9:ScheduledDate><v9:Location>NQAA</v9:Location><v9:Remarks>Preet</v9:Remarks><v9:Reason>Solicitado por el cliente.</v9:Reason><v9:ContactName>XXX</v9:ContactName></v9:CancelPickupRequest></soapenv:Body></soapenv:Envelope>';
        
        console.log(body);
        
        pickup(body,function(result){
            // console.log(result);
            convert.xmlDataToJSON(result).then(function (data) {
                console.log(data);
                var real =data;
                if(data["SOAP-ENV:Envelope"]){
                    data = data["SOAP-ENV:Envelope"];
                    if(data["SOAP-ENV:Body"]){
                        data = data["SOAP-ENV:Body"][0];
                        if(data['CancelPickupReply']){
                            data = data['CancelPickupReply'][0];
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