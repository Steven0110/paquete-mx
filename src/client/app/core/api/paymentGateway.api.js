(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('paymentGateway', paymentGateway);

  paymentGateway.$inject = ['$q', 'parse', 'parseheaders'];

  /* @ngInject */
  function paymentGateway($q, parse) {

    var conekta = {
      update      : update,
      remove      : remove,
      tokenize    : tokenize,
      createOrder : createOrder
    }

    return conekta;


    function remove(cardId){
      var Card = parse.endpoint('Card');
      return Card.remove(cardId);
    }

    function update(card){
      card.brand = Conekta.card.getBrand( card.number )
      card.termination = card.number.substr( card.number.length - 4 )
      var Cloud = parse.cloud('saveCard')
      return Cloud.post( card )
    }

    function tokenize(card){
      return new Promise((resolve, reject) => {
        let params = {
          card: {
            number:   card.card_number,
            name:     card.name,
            exp_year: card.exp_year,
            exp_month:card.exp_month,
            cvc:      card.cvc,
            birthDate:card.birthDate,
            address: {
                street1:  card.address_line_1,
                street2:  card.address_line_2,
                city:     card.city,
                state:    card.state,
                zip:      card.postal_code,
                country:  card.country
             }
          }
        }

        Conekta.Token.create(params,
          token => {
            params.card.token = token.id
            resolve( params.card )
          },
          error => reject( error)
        )

      })
    }

    function createOrder(params){
      return new Promise((resolve, reject) => {

      })
      Conekta.Order.create({
        "currency": "MXN",
        //"customer_info": {
        //  "customer_id": "cus_zzmjKsnM9oacyCwV3"
        //},
        "line_items": [{
          "name": "Box of Cohiba S1s",
          "unit_price": 10,
          "quantity": 1
        }],
        "charges": [{
          "payment_method": {
            "type": "default"
          }
        }]
      }, function(err, order) {
          console.log(order.toObject())
      })
    }

  }
})();