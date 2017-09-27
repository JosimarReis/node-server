'use strict';

var request = require('request');
var rp = require('request-promise');
var Promisse = require('bluebird');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var validUrl =require('valid-url');

var CidadesModel = require('../models/cidadesModel');


/**
* Este metodo ira percorrer pela base de dados de cidades e solicitar a distancias entre as cidades via url
* url http://www.distanciasentrecidades.com/pesquisa?from=Água Branca - AL, Brasil&to=Anadia - AL, Brasil
*/
exports.calcularDistancias = function(req, res){

  CidadesModel.find({})
  .exec(
    (cidades) => {
      mostrarCidades().apply({response:res, cidade:cidades});
    }
  )
  .catch((err) => console.log(err));


}
//retorna todas as cidades
var mostrarCidades = function(){

this.response.json(this.cidade);

}
