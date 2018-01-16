var https = require("https");
// var moment = require("moment");


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
      'Content-Type': 'application/json',
    }

    var hostname = "wwwcie.ups.com";
    var path = '/rest/FreightPickup';
    if(production){
      hostname =  "onlinetools.ups.com";
      path = '/rest/FreightPickup';
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
    var debugging = false;
    if(event){
        var data = event;

        var pickUpDate = "2018001";
        var startDay = "0800";
        var endDay = "1600";
        var packages =  [{
                           "HazMatIndicator":"",
                           "PackagingType":{
                              "Code":"BOX",
                              "Description":"Rate"
                           },
                           "NumberOfPieces":"1",
                           "DescriptionOfCommodity":"Description",
                           "Weight":{
                              "UnitOfMeasurement":{
                                 "Code":"Kgs",
                                 "Description":"Kilogramos"
                              },
                              "Value":"100"
                           }
                        }];
        
        
        body = {
                 "Security":{
                    "UsernameToken":{
                       "Username":"jc.canizal",
                       "Password":"Kernelpanic0923"
                    },
                    "UPSServiceAccessToken":{
                       "AccessLicenseNumber":"8D2F40C8969A08AC"
                    }
                 },
                 "FreightPickupRequest":{
                    "Request":{
                       "TransactionReference":{
                          "CustomerContext":""
                       }
                    },
                    "AdditionalComments":"AdditionalComments",
                    "DestinationPostalCode":"09770",
                    "DestinationCountryCode":"MX",
                    "Requester":{
                       "AttentionName":"Carlos Canizal",
                       "EMailAddress":"jc.canizal@gmail.com",
                       "Name":"Carlos Canizal",
                       "Phone":{
                          "Number":"5535068102"
                       }
                    },
                    "ShipFrom":{
                       "AttentionName":"Jose Carnizal",
                       "Name":"Jose Canizal",
                       "Address":{
                          "AddressLine":"Rio Misisipi Mz 45 Lt 43",
                          "City":"Iztapalapa",
                          "StateProvinceCode":"DF",
                          "PostalCode":"0970",
                          "CountryCode":"MX"
                       },
                       "Phone":{
                          "Number":"5535068102"
                       }
                    },
                    "ShipmentDetail": packages,
                    "PickupDate": pickUpDate,
                    "EarliestTimeReady": startDay,
                    "LatestTimeReady": endDay
                 }
              };
        
        pickup(body,function(result){
            var json = {};
            result = JSON.parse(result);

            console.log(result);
            if(debugging){
                json.result = result;
            }
            if(result.FreightPickupResponse){
              if(result.FreightPickupResponse){
                if(result.FreightPickupResponse.PickupRequestConfirmationNumber){
                  json.confirmation = result.FreightPickupResponse.PickupRequestConfirmationNumber;

                }
              }
            }else{
              if(result.Fault && result.Fault.detail){
                if(result.Fault.detail && result.Fault.detail.Errors){
                  if(result.Fault.detail.Errors.ErrorDetail && result.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode && result.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description)
                  json.error = true;
                  json.message = result.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description;
                }
              }
            }

            context.succeed(json);
            
        });
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};