'use strict';

var request = require('request');
var rp = require('request-promise');
var Promisse = require('bluebird');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var validUrl =require('valid-url');
var fs = require('fs');
var anuncio = require('./../models/anuncio');
var AnuncioModel = require('./../models/anuncioModel');
var AnunciosAntigosModel = require('./../models/anunciosAntigosModel');


var mfRural = {
    nome:'MFRural',
    url_base:'http://www.mfrural.com.br/',
    url_busca:'http://www.mfrural.com.br/busca.aspx?palavras=',
    url_separador: '&pg=', 
    termo: 'soja'
};


Array.prototype.duplicates = function (){
    return this.filter(function(x,y,k){
        return y !== k.lastIndexOf(x) ;
    }) ;
}

//adicionar anuncnio
var mongo_create_a_anuncio = function(anuncioModel){

    anuncioModel.save(function(err, anuncio){
        if(err)
            console.log("erro ao inserir anuncio. "+err)
    });
    
}


exports.buscarDados = function(req, res){
    res.send('Buscar.');
};

exports.postar = function(req, res){
    res.send('postado');
};

// iniciar a coleta de dados
//verifica a quantidade de paginas que a consulta no site mfrural ira retornar
var iniciarColeta = function(site){
    var qtd =0;
    var url = site.url_busca+site.termo;
    
    request(url,function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

             //colhe a quantidade de paginas a serem carregadas
            $('.pagination li').filter(function(){
                    var data = $(this);
                    qtd = data.children().last().attr('href').split('&pg=')[1];  
                    
            });

           colher(site, qtd);
        }
    });
}

//pega detalhes do anuncio
var getDetalhesAnuncios = function(pagina){
   request(pagina.url,function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

        var an = anuncio;
        $('.detalhesTitulo').filter(function(){
            var data = $(this);
            an.titulo = data.attr('title');
        });
        an.url = pagina.url;

        $('.produto-preco').filter(function(){
            var data = $(this);
            an.preco = data.text();
        });
        $('.divDescricao').filter(function(){
            var data = $(this);
            an.descricao = data.text();
        });
        
        $('.detalhesMapa').filter(function(){
            var data = $(this);
            var temp = data.attr('onclick').split('=')[1].split('/');
            an.localizacao.cidade = temp[0].replace(/-/g," ");
            an.localizacao.uf = temp[1];
           
        });

        $('.jcarousel-skin-pika li img').filter(function(){
            var data = $(this);
            an.imagem = data.attr('src');
            
        });
        
        an.anunciante.nome = "MFRural";
        an.anunciante.site = an.url;
        console.log(an);
      //  mongo_create_a_anuncio(AnuncioModel(an));
    }
    });

}
//
exports.iniciarColetaRota = function(req, res){
    res.send('Iniciando coleta de dados')
    iniciarColeta(mfRural);
}

exports.list_all_anuncios = function(req, res) {
    AnuncioModel.find({}, function(err, anuncio) {
      if (err)
        res.send(err);
      res.json(anuncio);
    });
  };

  
var colher = function(site, quantidadePaginas){
    console.log("temos "+quantidadePaginas+" de paginas");
    var url = site.url_busca+site.termo;
        //busca a quantidade de paginas para percorrer a lista
      
        var ps = [];
        var links = [];
            
           //percorre pelas paginas e colhe os links
           for(var i=1; i<=quantidadePaginas; i++){
              var  options={
                   uri: mfRural.url_busca+mfRural.termo+mfRural.url_separador+i,
                   transform: function(body){
                    return cheerio.load(body);
                }
               }
             
          ps.push(rp(options)
           .then(function ($) {
                   $('.boxAnunciosTitulo').filter(function(){
                       var data = $(this);
                       links.push(data.attr('href'));
                   })
               }));
        } // fim do laço

        //executa uma promisse com todas as solicitacoes.
        Promisse.all(ps)
        
        .then(function(){
            /**
            var arquivo =  new Date().getTime()+'.json';
            fs.writeFile(arquivo, JSON.stringify(links, null, 4), function(err){
             console.log('arquivo com links criados');
             
            })
            */

            var anuncios = [];
            console.log("Lista 01 => "+links);
            var paginas = links.duplicates();
            console.log("Lista 02 => "+paginas);
            
            paginas.forEach(function(link) {
                if(validUrl.isHttpUri(link)){
                var options = {
                    uri:link,
                    transform: function(body){
                        return cheerio.load(body);
                    }};
                    console.log(options);
                anuncios.push(rp(options).then(function ($) {
                    
                        var an = anuncio;
                        an.url = link;
                        $('.detalhesTitulo').filter(function(){
                            var data = $(this);
                            an.titulo = data.attr('title');
                        });
                
                        $('.produto-preco').filter(function(){
                            var data = $(this);
                            an.preco = data.text();
                        });
                        $('.divDescricao').filter(function(){
                            var data = $(this);
                            an.descricao = data.text();
                        });
                        
                        $('.detalhesMapa').filter(function(){
                            var data = $(this);
                            var temp = data.attr('onclick').split('=')[1].split("'")[0].split('/');
                            an.localizacao.cidade = temp[0].replace(/-/g," ");
                            an.localizacao.uf = temp[1];
                           
                        });
                
                        $('.jcarousel-skin-pika li img').filter(function(){
                            var data = $(this);
                            an.imagem = data.attr('src');
                            
                        });
                        
                        an.anunciante.nome = "MFRural";
                        an.anunciante.site = an.url;
                        
                        mongo_create_a_anuncio(AnuncioModel(an));

                    }).catch(err => console.log('erro na options ='+options.uri+' err++'+err))
                )
            }
            });

        Promisse.all(anuncios).catch(err => console.log("erro na promisse- salvar detalhes: "+err));
        

        })
        .catch(err => console.log("erro na promisse: "+err));
        
   
  }

  
//copia base dados antiga salva em anunciosantigos
// remove os anuncios existentes
//inicia a coelta de novos anuncios.
exports.mongo_bkp_all_anuncio = function(req, res){
    
    AnuncioModel.find({}, function(err, anuncio) {
        if (err)
          res.send(err);
        //res.send(anuncio);
        
        AnunciosAntigosModel({anuncios:anuncio}).save(function(err){
            if(!err){
                //apaga os anuncios anteriores
            AnuncioModel.remove(function(err){
                if(!err){
                    //inicia coleta de novos dados
                    iniciarColeta(mfRural);
                }
            });
        }
        });

      });
}

exports.cidades = function(req, res){
    var ps = [];
    for(var i=1; i<=2; i++){
        var  options={
             uri: "http://localhost:3000/api/geo",
             transform: function(body){
              return cheerio.load(body);
          }
         }
       
    ps.push(rp(options).then(function($){

    }).catch(function(err){
        console.log(err);
    }));
  } // fim do laço

  //executa uma promisse com todas as solicitacoes.
  Promisse.all(ps)
  res.json([]);
}