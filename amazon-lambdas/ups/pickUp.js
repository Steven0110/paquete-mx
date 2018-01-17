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
        console.log(data);
        var pickUpDate = "";
        if(data.date){
            var date = data.date.split('-');
            if(date[0]){
                pickUpDate += date[0];
            }else{
                var err= generateError(400,"Invalid date format YYYY-MM-DD Year");
                context.fail(err);
            }
            
            if(date[1]){
                pickUpDate += date[1];
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
            startDay = data.start.replace(":","");
        }else{
            var err= generateError(400,"start time is required HH:mm");
            context.fail(err);
        }
        
        var endDay;
        if(data.end){
            endDay = data.end.replace(":","");
        }else{
            var err= generateError(400,"end time is required HH:mm");
            context.fail(err);
        }
        
        var packages = [];
        
        if(data.packages){
            for(var i=0; i< data.packages.length; i++){
                var item = data.packages[i];
                // var NumberOfPieces = (data.packages.length).toString();
                var weight = item.weight.toString();
                var packageItem =  {
                                       "HazMatIndicator":"",
                                       "PackagingType":{
                                          "Code":"BOX",
                                          "Description":""
                                       },
                                       "NumberOfPieces": "1",
                                       "DescriptionOfCommodity":"Description",
                                       "Weight":{
                                          "UnitOfMeasurement":{
                                             "Code":"Kgs",
                                             "Description":"Kilogramos"
                                          },
                                          "Value": weight
                                       }
                                    };
                packages.push(packageItem);
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
                    "AdditionalComments":"",
                    "DestinationPostalCode": to.zip,
                    "DestinationCountryCode": to.country.code,
                    "Requester":{
                       "AttentionName": to.name,
                       "EMailAddress":to.email,
                       "Name": to.name,
                       "Phone":{
                          "Number": to.phone
                       }
                    },
                    "ShipFrom":{
                       "AttentionName": from.name,
                       "Name": from.name,
                       "Address":{
                          "AddressLine": from.street+" "+from.number+" "+from.apt,
                          "City": from.city,
                          "StateProvinceCode": from.state,
                          "PostalCode": from.zip,
                          "CountryCode":from.country.code
                       },
                       "Phone":{
                          "Number": from.phone
                       }
                    },
                    "ShipmentDetail": packages,
                    "PickupDate": pickUpDate,
                    "EarliestTimeReady": startDay,
                    "LatestTimeReady": endDay
                 }
              };
        
        pickup(body,function(result){
            console.log(result);
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
                  context.succeed(json);
                }
              }
            }else{
              if(result.Fault && result.Fault.detail){
                if(result.Fault.detail && result.Fault.detail.Errors){
                  if(result.Fault.detail.Errors.ErrorDetail && result.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode && result.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description){
                    json.error = true;
                    json.message = result.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description;
                    var err= generateError(400,json.message);
                    context.fail(err);
                  }
                }
              }
            }

            // context.fail(json);
            
        },function(err){
            console.log(err);
            var err =  JSON.stringify({"error":"Invalid JSON is required"});
            callback(err, null); 
        });
    }else{
        var err =  JSON.stringify({"error":"Invalid JSON is required"});
        callback(err, null); 
    }
    
};