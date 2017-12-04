var fedexAPI = require('shipping-fedex');
var async = require('async');
var q = require('q');

function generateError(code, message){
    return JSON.stringify({"status":code,"error":message});
}

function ship(data, items){
  var masterTrackingId = false;
  var counter = 0;
  var labels = [];
  var deferred = q.defer();
  async.eachSeries(items,function(item, next){
    var date = new Date();
    var packageCount = data.packageCount;
    var currentItem = item;

    var requestedShip = {
        ShipTimestamp: new Date(date.getTime() + (24*60*60*1000)).toISOString(),
        DropoffType: 'REGULAR_PICKUP',
        ServiceType: data.serviceType,
        PackagingType: 'YOUR_PACKAGING',
        TotalWeight:{
          Units: 'KG',
          Value: data.totalWeight
        },
        Shipper: data.shipper,
        Recipient: data.recipient,
        ShippingChargesPayment: {
          PaymentType: 'SENDER',
          Payor: {
            ResponsibleParty: {
              AccountNumber: "510087860"
            }
          }
        },
        LabelSpecification: {
          LabelFormatType: 'COMMON2D',
          ImageType: 'PNG',
          LabelStockType: 'PAPER_4X6'
        }
      };

    if(counter > 0 && masterTrackingId){
      requestedShip.MasterTrackingId = {
        TrackingIdType: "FEDEX",  
        TrackingNumber: masterTrackingId
      }
    }

    requestedShip.PackageCount = data.packageCount;
    requestedShip.RequestedPackageLineItems = currentItem;

    var fedex = new fedexAPI({
      environment: 'sandbox', // or live 
      debug: false,
      key: 't1uSywQP78fogZx4',
      password: 'PGptLQ6OQHFjYkdKhDhoZjV15',
      account_number: '510087860',
      meter_number: '118841995',
      imperial: true // set to false for metric 
    });

    fedex.ship({
      RequestedShipment: requestedShip
    }, function(err, res) {
      if(err) {
        console.log(err);
      }else{
        console.log(res);
        var trackingNumber = false;
        var label = false;
        if(res && res.CompletedShipmentDetail && res.CompletedShipmentDetail.MasterTrackingId && res.CompletedShipmentDetail.MasterTrackingId.TrackingNumber){
          trackingNumber = res.CompletedShipmentDetail.MasterTrackingId.TrackingNumber;
          if(trackingNumber && counter == 0){
            masterTrackingId = trackingNumber;
          }
        }
        if(res && res.CompletedShipmentDetail && res.CompletedShipmentDetail.CompletedPackageDetails && res.CompletedShipmentDetail.CompletedPackageDetails[0]&& res.CompletedShipmentDetail.CompletedPackageDetails[0].TrackingIds){
          trackingNumber = res.CompletedShipmentDetail.CompletedPackageDetails[0].TrackingIds[0].TrackingNumber;
          if(trackingNumber && counter == 0){
            masterTrackingId = trackingNumber;
          }
        }
        if(res && res.CompletedShipmentDetail && res.CompletedShipmentDetail && res.CompletedShipmentDetail.CompletedPackageDetails && res.CompletedShipmentDetail.CompletedPackageDetails[0] && res.CompletedShipmentDetail.CompletedPackageDetails[0].Label){
          currentLabel = res.CompletedShipmentDetail.CompletedPackageDetails[0].Label;
          if(currentLabel && currentLabel.Parts && currentLabel.Parts[0] && currentLabel.Parts[0].Image){
            label = currentLabel.Parts[0].Image;
          }
        }
        labels.push({TrackingNumber: trackingNumber, label: label});
          counter++;
        next();
      }
    });
},function(){
  deferred.resolve({trackingNumber: masterTrackingId,packages:labels});
});

return deferred.promise;
}

exports.handler = (event, context, callback) => {
    var body ={};
    if(event){
        var data = event;

        console.log(data);
        console.log(data);

        var debugging = false;
        
        if(data.debugging){
            debugging = true;
        }
        
        if(data.service){
          if(!data.service.code){
            context.fail(generateError(400,"service code is required in service attribute."));  
          }
        }else{
          context.fail(generateError(400,"fedex service data is required."));
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
      
  
//       var data = {
//   "debugging": true,
//   "packagingType": "package",
//   "from": {
//     "name": "Carlos Canizal",
//     "phone": "5535068102",
//     "street": "Rio Misisipi",
//     "number": "Mz 45",
//     "apt": "Lt 42",
//     "county": "Puente Blanco",
//     "city": "Iztapalapa",
//     "state": "Ciudad de México",
//     "country": {
//       "code": "MX"
//     },
//     "zip": "09770"
//   },
//   "to": {
//     "name": "Carlos Canizal",
//     "phone": "5535068102",
//     "street": "Hamburgo",
//     "number": "70",
//     "apt": "201",
//     "county": "Juarez",
//     "city": "Cuauhtemoc",
//     "state": "Ciudad de México",
//     "country": {
//       "code": "MX"
//     },
//     "zip": "06600"
//   },
//   "service": {
//     "code": "FIRST_OVERNIGHT"
//   },
//   "packages": [
//     {
//       "width": "25",
//       "weight": "1",
//       "length": "25",
//       "height": "25"
//     },
//     {
//       "width": "25",
//       "weight": "1", 
//       "length": "25",
//       "height": "25"
//     }
//   ]
// };





        var fromAddress = data.from.street+" "+data.from.number;
        if(data.from.apt){
          fromAddress += " "+data.from.apt;
        }

        var toAddress = data.to.street+" "+data.to.number;
        if(data.to.apt){
          toAddress += " "+data.to.apt;
        }
        var dataRequest = {
          serviceType: data.service.code,
          shipper : {
                Contact: {
                  PersonName: data.from.name,
                  PhoneNumber: data.from.phone
                },
                Address: {
                  StreetLines: [
                    fromAddress
                  ],
                  City: data.from.city,
                  // StateOrProvinceCode: 'TN',
                  PostalCode: data.from.zip,
                  CountryCode: data.from.country.code
                }
              },
          recipient : {
                Contact: {
                  PersonName: data.to.name,
                  PhoneNumber: data.to.phone
                },
                Address: {
                  StreetLines: [
                    toAddress
                  ],
                  City: data.to.city,
                  PostalCode: data.to.zip,
                  CountryCode: data.to.country.code,
                  Residential: false
                }
              }
        }

        var items =[];
        var totalWeight = 0;
        for(var i=0; i < data.packages.length; i++){

          var weight = parseFloat(data.packages[i].weight)
          totalWeight += weight;

          items.push({
                      SequenceNumber: i+1,
                      GroupPackageCount: 1,
                      Weight: {
                        Units: 'KG',
                        Value: data.packages[i].weight
                      },
                      Dimensions: {
                        Length: data.packages[i].length,
                        Width: data.packages[i].width,
                        Height: data.packages[i].height,
                        Units: 'CM'
                      },
                    });
        }

        dataRequest.totalWeight  = totalWeight.toFixed(2);


        dataRequest.packageCount = items.length;

        ship(dataRequest, items).then(function(res){
          // console.log(res);
          context.succeed(res);
        },function(err){
          // console.log(err);
          context.fail(err);
        });        
            
    }else{
        context.fail(generateError(400,"Invalid JSON is required."));
    }
    
};