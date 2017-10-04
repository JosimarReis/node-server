'use strict';

var request = require('request');
var rp = require('request-promise');
var Promisse = require('bluebird');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var validUrl =require('valid-url');
var distance = require('google-distance');

var CidadesModel = require('../models/cidadesModel');
var CidadesDistanciasModel = require('../models/cidadesDistanciasModel');
var PesquisasModel = require('../models/pesquisaModel');
var AnunciosModel = require('../models/anuncioModel');


exports.distanciaSimples = function(req, res){
  var keys = Object.keys(req.body);
  var params = JSON.parse(keys);

  distance.get(
    {
      origin: params.origem.cidade+", "+params.origem.uf,
      destination: params.destino.cidade+", "+params.destino.uf,
    },
    function(err, data){
      if(err) return console.log(err);

      res.json(data);
    }
  );


}


/**
* Este metodo ira percorrer pela base de dados de cidades e solicitar a distancias entre as cidades via url
* url http://www.distanciasentrecidades.com/pesquisa?from=Água Branca - AL, Brasil&to=Anadia - AL, Brasil


*/
exports.calcularDistancias = function(req, res){

  PesquisasModel.find({})
  .distinct("localizacao", (err, anuncios) => {
      if(err) console.log(err);

      res.json(anuncios.length);

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
