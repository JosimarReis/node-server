'use strict';
var NodeGeocoder  = require('node-geocoder');
var gmaputil = require('googlemapsutil');
var distance = require('google-distance');

var EstadosModel = require('./../models/estadosModel');
var CidadesModel = require('../models/cidadesModel');
var configGeo = require('./../config/geo');
var estados = require('../models/estados.json');
var AnuncioModel = require('./../models/anuncioModel');
var PesquisaModel = require('./../models/pesquisaModel');

exports.importar_cidades = function(req, res){
    estados.estados.forEach(function(estado) {
        var est = new EstadosModel(estado);
        est.save(function(err){
            if(err){
              console.log(err);
            }
    
            res.json({success:true});
        });
    }, this);
}

//consulta estado solicitado
exports.listar_cidades_por_estado = function(req, res){
    var keys = Object.keys(req.body);
    var params = JSON.parse(keys);
    if(params.sigla==='todos'){
        res.json([])
    }else{
    CidadesModel.find({'estado.sigla':params.sigla})
    .sort({
        nome:'asc'
    })
    .exec(function(err, cidades){
        if(err)
        console.log(err);

        res.json(cidades)
    })
}
};
exports.listar_cidades_por_estado_old = function(req, res){
    var keys = Object.keys(req.body);
    var params = JSON.parse(keys);
    if(params.sigla==='todos'){
        res.json([])
    }else{
    EstadosModel.find({sigla:params.sigla}, function(err, estado){
        if(err)
            console.log(err);
            var cidades = estado[0].cidades.split(',');
            var cidadesJson=[];
            cidades.forEach(function(item){
                cidadesJson.push({
                    nome:item,
                    uf:estado[0].sigla
                });
            });
        res.json(cidadesJson)
    })
}
};
exports.importaCidades = function(req, res){
    var cid=[];
    EstadosModel.find({}, function(err, estados){
        if(err)
        console.log('err -> '+err);
       
        estados.forEach(function(estado){

            var cidades = estado.cidades.split(',');
            
            cidades.forEach(function(item){
            var cidade = new CidadesModel({
                    nome:item,
                    estado:{sigla:estado.sigla,nome:estado.nome}
                });
                cidade.save();
                
            });
    });
})
};

exports.cidades_geolocalizacao = function(req, res){
    var geocoder = NodeGeocoder(configGeo);

    CidadesModel.find({'geo.latitude':{'$eq':""}})
    .limit(1)
    .exec(function(err,cidades){
     
        var i=0;
        cidades.forEach(function(cidade) {
            var param = cidade.nome+' '+cidade.estado.nome+' Brasil'
            geocoder.geocode(param)
            .then(function(response){
                response.forEach(function(item){
                var cidadeDados ={
                  geo:{
                      latitude:item.latitude,
                      longitude:item.longitude
                  },
                  cep:item.zipcode
                }

                CidadesModel.update({_id:cidade._id},cidadeDados,function(err){
                   if(err)
                    console.log(err)
                    res.json([])
                });
            });
        })
        .catch(function(err){
            if(err) console.log(err);
        
        });
            i++;
        }, this);
        console.log(i+" cidades")
    })

    
}

exports.distancia = function(req, res){




    PesquisaModel.find({})
    .sort({
        created:'desc'
    })
    .limit(1)
    .then((resultado) => {
        var rota ={
            pesquisa: resultado[0],
            destino: '',
            anuncios:'',
            origem:''
        }

        

            AnuncioModel.find( { $text:{$search:rota.pesquisa.termo}})
            .sort({
                created: 'desc'
            })
            .limit(1)
            .then((ann)=>{
                rota.anuncios=ann;
                ann.forEach(function(anuncio){
                rota.origem= cidadeDados(anuncio.localizacao)
                .then(function(ee){
                    rota.destino = cidadeDados(rota.pesquisa.localizacao)
                    .then(function(e){
                    res.json(rota);
                
                    });
                    
                })
                });

            })
            .catch((err) => console.log('anuncios ==> '+err))

    })

    .catch((err) => console.log('pesquisa ->> '+err));

}

var cidadeDados = function(cidadeUf){

    CidadesModel.find({ 
        $and:[ {nome:cidadeUf.cidade},
        {"estado.sigla":cidadeUf.uf}
        ]
    })
    .then((cidades)=>{
        return cidades[0];
    })
    .catch((err)=> {console.log(err);return new CidadesModel()});
}