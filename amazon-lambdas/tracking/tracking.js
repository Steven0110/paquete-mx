var https = require("https");
var http = require("http");
var async = require("async");
var q     = require("q");
var fedexAPI = require('shipping-fedex');
var convert = require('xml-to-json-promise');
var Parse = require('parse/node').Parse;


const production = true;
if(production){
  console.log('We are in production!');
  masterKey = "baplcn89UZ3uyJq0AflqtXjnFV2wRmo81SaWg7wd";
  appId = "OwwqTBzf9Tj618RyQqYmx3eJOhxaS8qolcojD3IA";
  javascriptKey = "gCi0VgG0NVmtZA7lKsAAVVAvk9IwECg2GMJHwWdQ";
}else{
  console.log('We are in development!');
  masterKey = "rZx1h8G9530G73xbzk5F1MLvGzb080KL2u55uC8S";
  appId = "OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1";
  javascriptKey = "wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL";
}

Parse.serverURL = 'https://parseapi.back4app.com/';
Parse.initialize(appId, javascriptKey, masterKey);

var buildTrack = function(trackingNumber, carrier){
  console.log(trackingNumber);
  var deferred = q.defer();
  if(carrier == "UPS"){
    var body = {
      "UPSSecurity": 
      { 
        "UsernameToken": 
          {
            "Username": "jc.canizal",
            "Password": "Kernelpanic0923" 
          
          },
        "ServiceAccessToken": {
          "AccessLicenseNumber": "8D2F40C8969A08AC"
        }
      },
      "TrackRequest": { 
        "Request": {
          "RequestOption": "1"
        },
        "InquiryNumber": trackingNumber
        
      }
    };

         
    track(body,function(result){
        var json = {};
        result = JSON.parse(result);
        // if(debugging){
        //     json.result = result;
        // }
        
        json = result;
        
        var activity = [];
        if(json.TrackResponse && json.TrackResponse.Shipment && json.TrackResponse.Shipment.Package){
            var track = json.TrackResponse.Shipment.Package;
            if(track.Activity){
                if(track.Activity[0]){
                    activity = track.Activity;
                }else{
                    activity.push(track.Activity);
                }
            }else if(track[0]){
                for(var i=0;i <track.length;i++){
                    if(track[i].Activity){
                        activity.push(track[i].Activity)
                    }
                }
            }
        }


        var response =[];
        if(track && track.TrackingNumber)
            trackingNumber = track.TrackingNumber;
        for(var i =0; i< activity.length; i++){
            var activityItem = activity[i];
            
            var item = {
                status:{},
                location:{},
                dateTime: "",
                trackingNumber: trackingNumber,
                original: activityItem
            };
            if(activityItem.Status){
                if(activityItem.Status.Type){
                    item.status.type  = activityItem.Status.Type;
                }
                
                if(activityItem.Status.Description){
                    item.status.description  = activityItem.Status.Description;
                }
            }
            if(activityItem.ActivityLocation){
                if(activityItem.ActivityLocation.Address){
                    if(activityItem.ActivityLocation.Address.City)
                        item.location.city = activityItem.ActivityLocation.Address.City;
                    if(activityItem.ActivityLocation.Address.CountryCode)
                        item.location.countryCode = activityItem.ActivityLocation.Address.CountryCode;
                }
                
                if(activityItem.ActivityLocation.Description){
                    item.location.description = activityItem.ActivityLocation.Description;
                }
                
                if(activityItem.ActivityLocation.SignedForByName){
                    item.location.signedForByName = activityItem.ActivityLocation.SignedForByName;
                }
                
            }
            
            if(activityItem.Date){
              activityItem.Date = activityItem.Date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
              item.dateTime +=  activityItem.Date;
            }[]
            
            if(activityItem.Time){
                activityItem.Time =  activityItem.Time.replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3");
               item.dateTime +=  "T"+activityItem.Time+"Z";
            }

            if(item.status.description == "Order Processed: Ready for UPS"){
              item.status.type = "L";
            }
            
            response.push(item);
        }
        
        deferred.resolve(response);
    });
  }else if(carrier == "FEDEX"){
    var response =[];

    var options = {
      environment: 'live', // or live 
      debug: false,
      key: 'raF7pWAdOFqh7RWp',
      password: 'IpYuI9OM9zUIbTOZKg7mylyqo',
      account_number: '912197689',
      meter_number: '111951423',
      imperial: false // set to false for metric 
    }

    if(production){
      options.environment = "live";
    }


    var fedex = new fedexAPI(options);

    fedex.track({
      SelectionDetails: {
        PackageIdentifier: {
          Type: 'TRACKING_NUMBER_OR_DOORTAG',
          Value: trackingNumber
        }
      }
    }, function(err, res) {
      if(err) {
        return console.log(err);
      }

      // console.log(res);
      var json ={
        location:{},
        status:{}
      };

      json.status.description = res.CompletedTrackDetails[0].TrackDetails[0].Events[0].EventDescription;

      // if(json.status.description && json.status.description != 'Shipment information sent to FedEx'){
        json.trackingNumber = res.CompletedTrackDetails[0].TrackDetails[0]['TrackingNumber'];
        
        json.dateTime = (res.CompletedTrackDetails[0].TrackDetails[0].Events[0].Timestamp).toString();
        json.location.city = res.CompletedTrackDetails[0].TrackDetails[0].Events[0].Address.City;
        json.location.countryCode = res.CompletedTrackDetails[0].TrackDetails[0].Events[0].Address.CountryCode;
        json.location.description = res.CompletedTrackDetails[0].TrackDetails[0].Events[0].Address.countryCode;
        if(json.status.description == "Delivered"){
          json.status.type = "D";
          if(res.CompletedTrackDetails[0].TrackDetails[0].DeliverySignatureName){
            json.location.signedForByName = res.CompletedTrackDetails[0].TrackDetails[0].DeliverySignatureName;
          }
        }else if(json.status.description == "Picked up"){
          json.status.type = "P";
        }else if(json.status.description == "Shipment information sent to FedEx"){
          json.status.type = "L";
        }else{
          json.status.type = "I";
        }
        response.push(json);
      // }
      deferred.resolve(response);
    });

  }else if(carrier == "REDPACK"){
    var pin = "QA j54/PyzkOAeMZzGPNFBpP/y8thMFFdZfbqZTWYQ8sjw=";
    var idUsuario = "785";
    var response =[];
    body = '<?xml version="1.0" encoding="UTF-8"?> \
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://vo.redpack.com/xsd">\
              <soapenv:Body>\
                <rastreo xmlns="http://ws.redpack.com">\
                  <PIN>PROD j54/PyzkOAeMZzGPNFBpP/y8thMFFdZfbqZTWYQ8sjw=</PIN>\
                  <idUsuario>785</idUsuario>\
                  <guias>\
                    <numeroDeGuia>'+trackingNumber+'</numeroDeGuia>\
                  </guias>\
                </rastreo>\
              </soapenv:Body>\
            </soapenv:Envelope>';
    trackRedpack(body,function(result){
      if(result){
        var item = {
          status:{},
          location:{},
          dateTime: "",
          trackingNumber: trackingNumber,
        };

        convert.xmlDataToJSON(result).then(function(data){
          var body = data;
          var signedForByName =false;
          if(body['soapenv:Envelope']){
            body = body['soapenv:Envelope'];
            if(body['soapenv:Body'] && body['soapenv:Body'][0]){
              body = body['soapenv:Body'][0];
              if(body['ns:rastreoResponse'] && body['ns:rastreoResponse'][0]){
                body = body['ns:rastreoResponse'][0];
                if(body['ns:return'] && body['ns:return'][0]){
                  body = body['ns:return'][0];
                  if(body['ax21:paquetes'] && body['ax21:paquetes'][0]){

                    if(body['ax21:personaRecibio'] && body['ax21:personaRecibio'][0]){
                      if(!body['ax21:personaRecibio'][0]['$']){
                        item.location.signedForByName = body['ax21:personaRecibio'][0];
                      }
                    }


                    body = body['ax21:paquetes'][0];
                    if(body['ax21:detallesRastreo'] && body['ax21:detallesRastreo'].length > 0){
                      var activity = body['ax21:detallesRastreo'][0];

                      if(activity['ax21:evento'] && activity['ax21:evento'][0]){
                        var type = activity['ax21:evento'][0];
                        item.status.description = type;

                        if(type == "ENTREGADO")
                          item.status.type = "D";
                        else if(type == "REGISTRADO EN SISTEMA")
                          item.status.type = "P";
                        else
                          item.status.type = "I";
                      }

                      if(activity['ax21:fechaEvento'] &&  activity['ax21:fechaEvento'][0]){
                        item.dateTime = activity['ax21:fechaEvento'][0];
                      }

                      if(activity['ax21:localizacion'] && activity['ax21:localizacion'][0]){
                        item.location.description = activity['ax21:localizacion'][0];
                      }
                    }
                  }
                }
              }
            }
          }

          // console.log(body);
          // console.log(signedForByName);
          if(item.dateTime)
            response.push(item);
          // console.log(response);
          deferred.resolve(response);
        },function(err){
          deferred.reject(err);
        });
      }else{
        deferred.reject(result);
      }
    },function(err){
      deferred.reject(err);
    })
  }

  return deferred.promise;
}

var trackRedpack = function(data,success,error){
    var production =  false;
    var headers = {
      'Content-Type': 'text/xml',
    }

    var hostname = "ws.redpack.com.mx";
    var path = '/RedpackAPI_WS/services/RedpackWS?wsdl'
    if(production){
      hostname =  "";
      path = '/RedpackAPI_WS/services/RedpackWS?wsdl'
    }

    var options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: headers
    };
    var req =   http.request(options, function(res) {
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
    // data = JSON.stringify(data);
    req.write(data);
    req.end();
}

var track = function(data,success,error){
    var production =  false;
    var headers = {
      'Content-Type': 'application/json',
    }

    var hostname = "wwwcie.ups.com";
    var path = '/rest/Track'
    if(production){
      hostname =  "onlinetools.ups.com";
      path = '/rest/Track'
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
  var Shipping = Parse.Object.extend('Shipping');
  var query = new Parse.Query(Shipping);
  query.equalTo("delivered",false);

  return query.find().then(function(res){
    var deferred =  q.defer();
    var promises = [];
    async.eachSeries(res,function(shipping,callback){
      var trackingNumber = shipping.get("trackingNumber");
      var carrier = shipping.get("carrier");
      if(trackingNumber){
        promises.push(
          buildTrack(trackingNumber, carrier).then(function(res){
            console.log(res);
            var currentActivity = shipping.get('activity');
            currentActivity = currentActivity?currentActivity:[];
            var lastActivity = false;
            var validated = false;

            if(currentActivity && currentActivity.length > 0){
              lastActivity = currentActivity[currentActivity.length-1];
            }

            for(var i=0; i<res.length; i++){
              if(lastActivity.dateTime != res[res.length-1].dateTime){
                validated = true;
                shipping.set('procceded',true);
                var newActivity = currentActivity.concat(res);
                shipping.set('activity',newActivity);

                if(res[i].status && res[i].status.type){
                  if(res[i].trackingNumber == trackingNumber){

                    if(res[i].status.type == "D"){
                      shipping.set('delivered', true);
                      shipping.set('status', "delivered");
                    }
                    if(res[i].status.type == "D"){
                      shipping.set('delivered', true);
                      shipping.set('status', "delivered");
                    }
                    else if(res[i].status.type == "X"){
                      shipping.set('delivered', false);
                      shipping.set('status', "exception"); 
                    }
                    else if(res[i].status.type == "P"){
                      shipping.set('delivered', false);
                      shipping.set('status', "pickup"); 
                    }
                    else if(res[i].status.type == "M"){
                      shipping.set('delivered', false);
                      shipping.set('status', "manifest_pickup"); 
                    }
                    else if(res[i].status.type == "I"){
                      shipping.set('delivered', false);
                      shipping.set('status', "in_transit"); 
                    } 
                    else if(res[i].status.type == "L"){
                      shipping.set('delivered', false);
                      shipping.set('status', "label_created"); 
                    }else{
                      shipping.set('delivered', false);
                      shipping.set('status', "in_transit"); 
                    }
                  }
                }
              }
            }
            if(validated){
              return shipping.save();
            }
            else{
              var deferred2 = q.defer()
              deferred2.promise
              return deferred2;
            }
          }).then(function(){
            callback();
            var deferred =  q.defer();
            deferred.resolve();
            return deferred.promise;
          })
        );
        
      }else{
        callback();
      }
    },function(){
      q.all(promises).then(function(){
        deferred.resolve();
      })
    });

  return deferred.promise;

  }).then(function(){
    console.log('all done');
    context.succeed(result);
  },function(err){
    console.log(err);
  });
};
