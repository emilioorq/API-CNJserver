# Laboratorio 2 -Desarrollo de Aplicaciones en Red
## API-CNJserver
Servicio API con lista de chistes de chick norris.

#### Crear servidor de la API

<code>
<script>  
     var express = require('express');

    var randomItem = require('random-item');
    var jsonQuery = require('json-query');
    var fs = require('fs');

    var chistes = JSON.parse(fs.readFileSync('ChistesCN4.json'));

    var cnjserver = express();
    cnjserver.get('/',function(request, response){
        response.json({mensaje: 'Hola desde Express!'});
    })

    cnjserver.get('/api/chistes',function(req,res,next){
        res.json(randomItem(chistes));
    })

    cnjserver.get('/api/chistes/:id',function(req,res,next){
        res.json(jsonQuery('[id='+req.params.id+']',{data: chistes}).value);
    })
    cnjserver.listen(process.env.PORT || '5000');
</script>


