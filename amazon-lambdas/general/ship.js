var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'us-west-2' //change to your region
});

function generateError(code, message){
    return JSON.stringify({"status":code,"error":message});
}

exports.handler = (event, context, callback) => {
    var type =  null;
    var shipping =  {};
    const production = false;
    const types = ['ups','fedex','redpack'];
    var functions = {};
    if(production){
        functions = {
            "ups"     : "PROD-UPS-Ship",
            "fedex"   : "PROD-FEDEX-Ship",
            "redpack" : "PROD-REDPACK-Ship"
        }
    }else{
        functions = {
            "ups"     : "DEV-UPS-Ship",
            "fedex"   : "DEV-FEDEX-Ship",
            "redpack" : "DEV-REDPACK-Ship"
        }
    }
    
    if(event.type && types.indexOf(event.type) >= 0){
        type =  event.type;
    }else{
        var string = types.join(', ');
        context.fail(generateError(400,"ship type is  required values can be: "+string),null);
    }
    
    if(event.shipping){
        shipping = event.shipping;
    }
    
    if(event.debugging === true){
        shipping.debugging = true;
    }
    
    var functionName = functions[type];
        
    lambda.invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(shipping, null, 2)
    }, function(error, data) {
      if (error) {
        context.done(error);
      }else{
        if(data.Payload){
            var result = JSON.parse(data.Payload);
            if(result.errorMessage){
                context.done(result.errorMessage);
            }
            context.succeed(result)
        }
      }
    });
    
}