# Laboratorio 2 -Desarrollo de Aplicaciones en Red
## API-CNJserver
Servicio API con lista de chistes de chick norris.

### Primeros pasos.

Instalamos la extensión para que nos permita guardar el codigo en un archivo local.

![Descarga del código de la web](https://github.com/emilioorq/API-CNJserver/blob/master/01.jpg)

Lo guardamos en el archivo **chistes raw.html**. E instalamos la extensión **Regex Preview** que nos permite evaluar el patrón que hayamos elegido para extraer los chistes de Chuck Norris.

La *expresión regular* (E.R) inicial sería 
`var re = /^\d{0,3}-?\s?(.*Chuck.+\.?)<br \/>/igm;`, 
donde se pretende que se filtre el contenido que pueda contener la estructrura que le marca la expresión.    
Para explicarla vamos a ir por partes.  
1. Cualquier E.R se acota por slashes */*
2.  El simbolo circunflejo *^* indica que el contenido tiene que empezar por lo que le precede.
3.  El simbolo *\d* indica que tiene que ser un dígito, y acontinuación cuantos dígitos, *{0,3}* que para este caso pueden variar en 0 (ninguno) o 3 números ( ej. 230 ).
4. Le sigue dos simbolos *-?*,  el primero en una guión y el simbolo de interrogación quiere reflar que es *opcional* lo que filtro interpretará que puede aparecer o no (Ej. 230- ó 230)
5. Un símbolo *\s* indica un espacio en blanco, y acontinuación otro simbolo de interrogación que lo hace opcional.
6. Entre parentesis *()* indica que quiere recoger todo lo que vaya dentro como un todo, así que este empieza con un punto *.\** para indicar que puede ser ninguno o más caracteres que haya entre los números y lo que viene acontinuación, que es por lo que podemos encontrar más coincidencias entre los chiste, la palabra *Chuck*.   Lo siguiente otro punto *.+* pero ahora sí debe haber al menos uno o más caracteres después de Chuck. Por último *\.?* quiere indicar que se trata de un punto donde termina la frase o el contenido, por eso lleva una barra invertida a modo de protección para que no se entienda como el punto que hemos usado anteriormente. Como además tiene el signo de interrogación, expresa que la frase puede terminar en punto (.) o sin él.   
7. Lo que le sigue es la etiqueta en **html** del salto de linea *<br \\>*  
8. El final *\igm* se utilizan como opciones para afinar más el *tamiz* de la expresión regular.   *i* hace la expresión menos sensitiva a los resultados que encuentra, por lo que puede obtener mejores resultados.   *m* Indica que los delimitadores (^) y ($) se pueden aplicar para más de una linea del código.   *g* se aplica para que la E.R no termine en la primera coincidencia y pueda recorrer el fichero entero.

![Test de la expresión regular que aplicamos](https://github.com/emilioorq/API-CNJserver/blob/master/02.png)

#### Descargar Chistes en JSON
```javascript
     // Se cargan los paquetes que va a necesitar para parsear los chistes y almacenarlos en un JSON.
     
     // Paquete Request, que permnite realizar llamadas HTTP. También soporta HTTPS y redirecciones.
     const request = require('request'); 
     
     // Paquete que permite limpiar todo el código de etiquetas HTML
     var sanitizeHtml = require('sanitize-html');
     
     // Este paquete comprueba que el fichero JSON cumpla con el standar del fichero.
     var jsonlint = require("jsonlint");
     
     // Dirección web donde esta el códgo con la lista de los chistes.
     const url_chistes = 'https://www.emudesc.com/threads/548-verdades-y-chistes-de-chuck-norris.134614/';
     
     // Comienza realizando una llamada a la url.
     request(url_chistes, { text: true }, (err, res, body) => {
         var re = /^\d{0,3}-?\s?(.*Chuck.+\.?)<br \/>/igm; //Expresión regular
         
         var chisteEncontrado = re.exec(body); // Sobre el \'body\' se evalua la E.R.
         
         chisteID = 1; //variable iteradora para recorrer el objeto donde se han almacenado los chistes.
         
         var chistesArray = []; // Declaración del array donde se van a almacenar los chistes en JSON.
         
         while (chisteEncontrado != null) { //Bucle para recorrer el objeto.
         
             textoChiste = sanitizeHtml(chisteEncontrado[1]); //Se almacena el texto en la variable y se elimnan las etiquetas html. 
             
             chisteObject = {id: chisteID, joke: textoChiste}; Se crea el objeto con la estructura JSON y se asignan los valores.
             
             chistesArray.push(chisteObject); // El objeto completo se guarda en una posición del array.
             
             chisteEncontrado = re.exec(body); // Se vuelve a evaluar la E.R sobre el contenido
             
             chisteID++; // Se incrementa el iterador.
         }
         chistesJSON = JSON.stringify(chistesArray); El array completo, se parsea a un objeto JSON
         
         console.log(chistesJSON); // Se muestra por pantalla.
         
         jsonlint.parse(chistesJSON); // La herramienta jsonlint comprueba que la estructura del objeto es correcta.
         
     }); <br/><br/>
     
```
          
       
Para guardar la lista completa de los chiste en un fichero JSON, por consola invocamos el comando     
**node parsearchistes.js > ChistesCN4.json**   

#### Crear servidor de la API
Lo siguiente que hacemos es montar un servicio API con el paquete **express**.    
Para este paso vamos a necesitar de otros paquetes adiccionales para mejorar la funcionalidad de nuetro servicio.

```
     // Express crea un servidor HTTP como servicio.
     var express = require('express');
    
    // En este caso vamos a usar un generador de números aleatorios para iterar el array de elemtos.
    var randomItem = require('random-item');
    
    // Paquete que permite la busqueda sobre un array de un identificador.
    var jsonQuery = require('json-query');
    
    // Sistema de ficheros para leer el fichero JSON
    var fs = require('fs');

    // Se carga el contenido del fichero en el objeto chistes
    var chistes = JSON.parse(fs.readFileSync('ChistesCN4.json'));
     
    // Se crear el objeto con el servidor.
    var cnjserver = express();
    
    // El servidor proporciona una salida a la llamada GET, en la ruta de inicio (/)
    cnjserver.get('/',function(request, response){
        response.json({mensaje: 'Hola desde Express!'}); // Le envia un mensaje.
    })

    // En la ruta '/api/chistes' la salida será un elemento aleatorio del objeto chistes.
    cnjserver.get('/api/chistes',function(req,res,next){
        res.json(randomItem(chistes));
    })

    // En esta salida, se puede proporcionar un identificador del elemento al final.
    cnjserver.get('/api/chistes/:id',function(req,res,next){
    
        // La herramienta de busqueda jsonQuery permite localizar un elemento pasandole unos parametros, en este caos el id.
        res.json(jsonQuery('[id='+req.params.id+']',{data: chistes}).value); 
    })
    
    // Enviamos el servicio al puerto '5000'.
    cnjserver.listen(process.env.PORT || '5000');

```

### Personalización de la App

En estas lineas se agrega información del proyecto, a la vez que se usa para configurar la ejecución de la aplicación.

```
{
  "name": "chuckserver",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node cnjserver.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.16.2",
    "json-query": "^2.2.2",
    "jsonlint-cli": "^1.0.1",
    "random-item": "^1.0.0",
    "request": "^2.83.0",
    "sanitize-html": "^1.17.0"
  }
}

```

Para comenzar, se escribe en consola    
**npm start**   

**Dependencias**   
Los paquetes que se usan en la aplicación para que funcione correctamente.    

![Resultado de la app,'/api/chistes'](https://github.com/emilioorq/API-CNJserver/blob/master/03.jpg)

![Resultado de la app,'/api/chistes/:id'](https://github.com/emilioorq/API-CNJserver/blob/master/04.jpg)




