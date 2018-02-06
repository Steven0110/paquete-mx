var https = require("https");
// var moment = require("moment");


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
      'Content-Type': 'application/json',
    }

    var hostname = "wwwcie.ups.com";
    var path = '/rest/Pickup';
    if(production){
      hostname =  "onlinetools.ups.com";
      path = '/rest/Pickup';
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
    
        if(!data.pickupConfirmation){
            var err= generateError(400,"pickupConfirmation is required");
            context.fail(err);
        }
        
        body = {
                   "UPSSecurity":{
                      "UsernameToken":{
                         "Username":"jc.canizal",
                         "Password":"Kernelpanic0923"
                      },
                      "ServiceAccessToken":{
                         "AccessLicenseNumber":"8D2F40C8969A08AC"
                      }
                   },
                   "PickupCancelRequest":{
                      "Request":{
                         "TransactionReference":{
                            "CustomerContext":"CustomerContext"
                         }
                      },
                      "CancelBy":"02",
                      "PRN": data.pickupConfirmation
                   }
                };
        
        pickup(body,function(result){
            console.log(result);
            var json = {};
            result = JSON.parse(result);
            
            if(result.PickupCancelResponse && result.PickupCancelResponse.Response && result.PickupCancelResponse.Response.ResponseStatus && result.PickupCancelResponse.Response.ResponseStatus.Description == 'Success'){
                context.succeed({confirmation: true});
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
            context.fail(result);
            
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