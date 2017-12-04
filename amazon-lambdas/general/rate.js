var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'us-west-2' //change to your region
});

function generateError(code, message){
    return JSON.stringify({"status":code,"error":message});
}

exports.handler = (event, context, callback) => {
    var type =  null;
    var production = false;
    var rate =  {};
    const types = ['ups','fedex','redpack','ivoy'];
    const functions = {};
    if(production){
        functions = {
            "ups"     : "PROD-UPS-Rates",
            "fedex"   : "DEV-Fedex-Rates",
            "redpack" : "DEV-RedPack"
        }
    }else{
        functions = {
            "ups"     : "DEV-UPS-Rates",
            "fedex"   : "DEV-Fedex-Rates",
            "redpack" : "DEV-RedPack"
        }
    }
    
    if(event.type && types.indexOf(event.type) >= 0){
        type =  event.type;
    }else{
        var string = types.join(', ');
        context.fail(generateError(400,"rate type is required values can be: "+string),null);
    }
    
    if(event.rate){
        rate = event.rate;
    }
    
    if(event.debugging === true){
        rate.debugging = true;
    }
    
    var functionName = functions[type];
        
    lambda.invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(rate, null, 2)
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