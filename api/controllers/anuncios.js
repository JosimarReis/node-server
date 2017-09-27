'use strict';

var EstadosModel = require('./../models/estadosModel');
var AnunciosModel = require('../models/anuncioModel');
var UsuarioModel = require('../models/UsuarioModel');
var PesquisaModel = require('./../models/pesquisaModel');

//consulta anuncios
exports.lista_anuncios_filtrados  = function(req, res){
    var keys = Object.keys(req.body);
    var params = JSON.parse(keys);
    //parametros de pesquisa
    var usuario= (params.usuario);

    var pesquisa = {
        $and: [
             { $text:{$search:params.termo}},
             { "localizacao.uf":params.uf},
             { "localizacao.cidade":params.cidade}             
        ]
    }

    if(params.uf==='todos'){
        var pesquisa = {
            $and: [
                 { $text:{$search:params.termo}}
                 
            ]
        }
    }
    if(params.cidades==='todos'){
        var pesquisa = {
            $and: [
                 { $text:{$search:params.termo}},
                 { "localizacao.uf":params.uf}
            ]
        }
    }
 
    AnunciosModel.find(pesquisa)
    .sort({
        created:'desc'
    })
    .limit(100)
    .exec(function(err, anuncios){
        if(err)
            console.log(err);
        var historico = new PesquisaModel({
            termo:params.termo,
             localizacao:{ 
                 uf:params.uf,
                  cidade:params.cidade
                },
            usuario:usuario
        });
        historico.save((err)=>console.log(err));
        res.json(anuncios)
    })
};

//carrega ultimos historico das pesquisas
exports.lista_historicos_pesquisas  = function(req, res){
    var keys = Object.keys(req.body);
    var params = JSON.parse(keys);
   
   
    PesquisaModel.find({usuario:params.usuario})
    .sort({
        created:'desc'
    })
    .limit(6)
    .exec(function(err, anuncios){
        if(err)
            console.log(err);

            res.json(anuncios)
    })
};