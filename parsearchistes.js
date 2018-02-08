


const request = require('request');
var sanitizeHtml = require('sanitize-html');
var jsonlint = require("jsonlint");

const url_chistes = 'https://www.emudesc.com/threads/548-verdades-y-chistes-de-chuck-norris.134614/';
request(url_chistes, { text: true }, (err, res, body) => {
    var re = /^\d{0,3}-?\s?(.*Chuck.+\.?)<br \/>/igm;
    var chisteEncontrado = re.exec(body);
    chisteID = 1;
    var chistesArray = [];
    while (chisteEncontrado != null) {
        textoChiste = sanitizeHtml(chisteEncontrado[1]);
        chisteObject = {id: chisteID, joke: textoChiste};
        chistesArray.push(chisteObject);
        chisteEncontrado = re.exec(body);
        chisteID++;
    }
    chistesJSON = JSON.stringify(chistesArray);
    console.log(chistesJSON);
    jsonlint.parse(chistesJSON);
});