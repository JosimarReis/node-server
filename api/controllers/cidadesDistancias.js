'use strict';

var request = require('request');
var rp = require('request-promise');
var Promisse = require('bluebird');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var validUrl =require('valid-url');

var CidadesModel = require('../models/cidadesModel');
var CidadesDistanciasModel = require('../models/cidadesDistanciasModel');


/**
* Este metodo ira percorrer pela base de dados de cidades e solicitar a distancias entre as cidades via url
* url http://www.distanciasentrecidades.com/pesquisa?from=Água Branca - AL, Brasil&to=Anadia - AL, Brasil


*/
exports.calcularDistancias = function(req, res){

  CidadesModel.find({})
  .limit(5)
  .exec(
    (err, cidades) => {
      if(err) console.log(err);
      // calcularDistanciasCidades(res, cidades);
      // res.json(cidades);
      var pagina= {
        url:"http://itinerarios-mapa.com/percurso/Água Branca AL Brasil-Anadia AL Brasil"
      }
      request(pagina.url,function(err, response, html){
       if(err)console.log(err);
           var $ = cheerio.load(html);
           var dados = {
             distancia:'',
             tempo:''
           }
           $('#SearchResul').filter(function(){
               var data = $(this);
               console.log(data.html());
               dados.distancia=data.html();
           })
           res.json(dados)
         });
    }
  );

}
//retorna todas as cidades
var mostrarCidades = function(){
  this.cidade.forEach(function(cidade){
    console.log(cidade.nome+" - "+cidade.estado.sigla+", Brasil");

  })
this.response.json(this.cidade);

}

var calcularDistanciasCidades = function(response, cidades){
  var ps = [];
  var distancias = [];

     //percorre pelas cidades  origem
     cidades.forEach(function(origem){
       //cidades destino
     cidades.forEach(function(destino){
       if(origem!==destino){
        var  options={
             uri: "http://www.distanciasentrecidades.com/pesquisa?from="+origem.nome+" - "+origem.estado.sigla
             +", Brasil&to="+destino.nome+" - "+destino.estado.sigla+", Brasil",
             transform: function(body){
              return cheerio.load(body);
          }
         }
        // response.json(options);

    ps.push(rp(options)
     .then(function ($) {
           var dados = {
             origem: origem,
             destino:destino,
             distancia:'',
             tempo:''
           }
           $('#kmsruta').filter(function(){
               var data = $(this);
               dados.distancia=data.text();
               console.log(dados);
           })
           $('#tiempo').filter(function(){
               var data = $(this);
               dados.tempo=data.text();
           })
           distancias.push(dados);
         }));
        }
       })

  })  // fim do laço

  //executa uma promisse com todas as solicitacoes.
  Promisse.all(ps)
  .then(function(){
    response.json(distancias);
  })
}
