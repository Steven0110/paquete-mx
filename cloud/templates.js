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
  personalWelcome: function(name){
    return '<div style="color:#333"><h2 style="text-align:center; color:#666;margin-bottom: 10px">¡Bienvenido a Paquete MX!</h2>\
  <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>Es un placer para el equipo de <span style="color:#f38b00">PAQUETE.MX</span> darte la Bienvenida, <span style="color:#f38b00">COTIZA</span> tus envíos y obtén diversas opciones, <span style="color:#f38b00">COMPARA</span> y elige la que más te convenga de acuerdo a precio y tiempo, y <span style="color:#f38b00">¡ENVÍA!</span></p>\
    <h3 style="color:#666">Recuerda que con tu cuenta puedes:</h3>\
    <ul>\
        <li>Cotizar tus envíos.</li>\
        <li>Obtener la etiqueta para tu envío.</li>\
        <li>Solicitar recolección de tus paquetes con un solo clic.</li>\
        <li>Rastrear tus envíos desde nuestra plataforma.</li>\
    </ul>\
    <div style="text-align:center;margin-top:20px"">\
        <h3 style="color:#666; text-align:center"> ¿Ya hiciste tu primer envió con <span style="color:#f38b00">PAQUETE.MX</span>?</h3>\
        <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx">¡COTIZA AHORA MISMO!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Bienvenido a PAQUETE.MX</h1>\
    </div>';
  },
  enterpriseWelcome: function(name){
    return '<div style="color:#333"><h2 style="text-align:center; color:#666;margin-bottom: 10px">¡Bienvenido a Paquete MX!</h2>\
    <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>Es un placer para el equipo de <span style="color:#f38b00">PAQUETE.MX</span> darte la Bienvenida, <span style="color:#f38b00">COTIZA</span> tus envíos y obtén diversas opciones, <span style="color:#f38b00">COMPARA</span> y elige la que más te convenga de acuerdo a precio y tiempo, y <span style="color:#f38b00">¡ENVÍA!</span></p>\
    <h3 style="color:#666">Recuerda que con tu cuenta puedes:</h3>\
    <ul>\
        <li>Cotizar tus envíos.</li>\
        <li>Obtener la etiqueta para tu envío.</li>\
        <li>Solicitar recolección de tus paquetes con un solo clic.</li>\
        <li>Rastrear tus envíos desde nuestra plataforma.</li>\
    </ul>\
    <h3 style="color:#666">¿Eres empresa y requires línea de crédito?</h3>\
    <p>PAQUETE.MX cuenta con una línea de crédito para empresas, para obtenela es necesario que nos proporciones los documentos que se listan a continuación:</p>\
    <ul>\
        <li>Acta Constitutiva.</li>\
        <li>Caratula Bancaria (Estado de cuenta bancario).</li>\
        <li>Constancia Fiscal SAT.</li>\
        <li>INE por ambos lados del Representante Legal.</li>\
        <li>Comprobante Domicilio del Representante Legal.</li>\
        <li>Autorización para verificar el Buró de Crédito. ( En el presente correo se adjunta la carta de autorización de Buró de Crédito)</li>\
    </ul>\
    <h3 style="color:#666">¿Comó envió mis documentos?</h3>\
    <p>Visita nuestro <span style="color:#f38b00">Dashboard</span> y en el menú, la opción <span style="color:#f38b00">EMPRESARIAL</span>, te permitirá subir cada uno de los documentos solicitados.</p>\
    <div style="text-align:center">\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡ENVIAR DOCUMENTOS!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px"">\
        <h3 style="color:#666; text-align:center"> ¿Ya hiciste tu primer envió con <span style="color:#f38b00">PAQUETE.MX</span>?</h3>\
        <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx">¡COTIZA AHORA MISMO!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Bienvenido a PAQUETE.MX</h1>\
    </div>';
  },
  pickupMail: function(name, trackingNumber, carrier){
    return '<div style="color:#333"><h2 style="text-align:center; color:#666;margin-bottom: 10px">¡Recolección exitosa: '+trackingNumber+'!</h2>\
  <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>El envío con número de guia <span style="color:#f38b00">'+trackingNumber+'</span> ya fue recolectado por la empresa <span style="color:#f38b00">'+carrier+'</span> recibirás notificaciones cuando se encuentre en tránsito. \
    <p>Recuerda que puedes seguir tus envíos y conocer todos los detalles desde tu Dashboard\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">¿Quieres estar al tanto?</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shippings">¡MIS ENVIOS!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Gracias por usar PAQUETE.MX</h1>\
    </div>';
  },
  delivered: function(name, trackingNumber, carrier){
    return '<div style="color:#333"><h2 style="text-align:center; color:green;margin-bottom: 10px">¡Entrega exitosa: '+trackingNumber+'!</h2>\
  <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>El envío con número de guia <span style="color:#f38b00">'+trackingNumber+'</span> ya fue entregado en destino por la empresa <span style="color:#f38b00">'+carrier+'</span>. \
    <p>Gracias por envíar con PAQUETE.MX, cuentanos como fue todo en hola@paquete.mx</p>\
    <p>Recuerda que puedes seguir tus envíos y conocer todos los detalles desde tu Dashboard\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">¿Quieres estar al tanto?</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shippings">¡MIS ENVIOS!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Gracias por usar PAQUETE.MX</h1>\
    </div>';
  },
  inTransit: function(name, trackingNumber, carrier){
    return '<div style="color:#333"><h2 style="text-align:center; color:#666;margin-bottom: 10px">¡Tu paquete se encuentra en tránsito: '+trackingNumber+'!</h2>\
  <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>El envío con número de guia <span style="color:#f38b00">'+trackingNumber+'</span> ya se encuentra en tránsito, puedes revisar el estatus en todo momento en PAQUETE.MX. \
    <p>Recuerda que puedes seguir tus envíos y conocer todos los detalles desde tu Dashboard\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">¿Quieres estar al tanto?</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shippings">¡MIS ENVIOS!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Gracias por usar PAQUETE.MX</h1>\
    </div>';
  },
  newInvoice: function(type, name, data, trackingNumber){
    if(type == 'ingreso'){
    return '<div style="color:#333"><h2 style="text-align:center; color:#666;margin-bottom: 10px">¡Tu Factura esta lista para descargarse!</h2>\
  <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>Tu Comprobante Fiscal Digital por Internet (CFDI 3.3) con folio <span style="text-align:center; color:#f38b00">'+data.invoiceNo+'</span>se encuentra adjunto en este correo electrónico, correspondiente a el envío con número de guia: <span style="color:#f38b00">'+trackingNumber+'</span></h3>\
    <p>Recuerda que también los puedes descargar desde tu Dashboard en la sección de facturas.</h3>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Ver mis Facturas</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/invoices">¡MIS FACTURAS!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Gracias por usar PAQUETE.MX</h1>\
    </div>';
    }else if(type =="pago"){
      return '<div style="color:#333"><h2 style="text-align:center; color:#666;margin-bottom: 10px">¡Complemento de Pago CFDI 3.3!</h2>\
  <div style="color:#333"><h4 style="text-align:center; color:#f38b00">COTIZA | COMPARA | ENVÍA</h4>\
    <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <h1 style="text-align: center;color:#f38b00">¡Hola <span style="text-transform: uppercase;">'+name+'</span>!</h1>\
    <p>Se genero un complemento de pago con folio <span style="text-align:center; color:#f38b00">'+data.invoiceNo+'</span> se encuentra adjunto en este correo electrónico.</h3>\
    <p>Recuerda que también los puedes descargar desde tu Dashboard en la sección de facturas.</h3>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Ver mis Facturas</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/invoices">¡MIS FACTURAS!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h3 style="color:#666; text-align:center">Visita y conoce tu Dashboard</h3>\
      <a style="display:inline-block;margin-top:10px;-webkit-border-radius: 8;-moz-border-radius: 8;border-radius: 8px;font-family: Arial;color: #ffffff;font-size: 14px;background: #f38b00;padding: 10px 20px 10px 20px;text-decoration: none;" href="https://paquete.mx/dashboard/shipping">¡IR A MI DASHBOARD!</a>\
    </div>\
    <div style="text-align:center;margin-top:20px">\
      <h1 style="color:#f38b00; text-align:center;margin:50px 0 30px 0">Gracias por usar PAQUETE.MX</h1>\
    </div>';
    }
  },
  recoveryTemplate: function(key){
    return '<h2 style="text-align: center;color:#f38b00">¡Recuperar Contraseña!</h2>\
            <div style="width:100%;height:2px; background-color: #ccc; margin: 10px 0"></div>\
    <div style="color:#333">¿Olvidaste tu contraseña? No te preocupes, haz clic en el siguiente botón para recuperarla:</div>\
    <div style="text-align:center; color:#333"><a href="https://paquete.mx/recovery-password/'+key+'"> Recuperar Contraseña</a></div>';
  }
}
exports.templates = templates;