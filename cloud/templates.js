var templates = {
  getOrderTemplate: function(fromAddress, toAddress, trackingNumber, amount, packages, carrier, service){
    return '<div style="color:#333"><h2 style="text-align:center; color:#f38b00">¡Todo esta listo para que hagas tu envío!</h2>\
            <ul style="color:#333">\
            <li>Imprime la etiqueta, que te esta adjunta y pégala en tu paquete o sobre.</li>\
            <li>Si es un envío multi-paquete verifica que cada etiqueta corresponda al paquete señalado.</li>\
            </ul>\
            <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h2 style="text-align: left;color:#f38b00">Resumen de tu orden:</h2>\
    <h4 style="color: #999">Origen:<br></h4>\
    <div style="color:#333">'+fromAddress+'</div>\
    <h4 style="color: #999">Destino:</h4>\
    <div style="color:#333">'+toAddress+'</div>\
    <h4 style="color: #999">Paquete:</h4>\
    <div style="color:#333">'+packages+'</div>\
    <h4 style="color: #999">Carrier:</h4>\
    <div style="color:#333">'+carrier+'</div>\
    <h4 style="color: #999">Servicio:</h4>\
    <div style="color:#333">'+service+'</div>\
    <h4 style="color: #999">Costo:</h4>\
    $ '+amount+' MXN<br>\
    &nbsp;\
    <div>\
    <h3 style="text-align:center; color: #999"> Tu Número de Guia es:</h3>\
    <h1 style="text-align:center; color: #f38b00">'+trackingNumber+'</h1>\
    </div></div>\
    ';
  },
  recoveryTemplate: function(key){
    return '<h2 style="text-align: center;color:#f38b00">¡Recuperar Contraseña!</h2>\
            <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <div style="color:#333">¿Olvidaste tu contraseña? No te preocupes, haz clic en el siguiente botón para recuperarla:</div>\
    <div style="text-align:center; color:#333"><a href="https://paquete.mx/recovery-password/'+key+'"> Recuperar Contraseña</a></div>';
  }
}
exports.templates = templates;