'use strict';

var UsuarioModel = require('./../models/UsuarioModel');


//verifica cadastro na base de dados
var verificaEmail = function(usuario){
   var usuarioTemp = new UsuarioModel();
   usuarioTemp.findOne({email:usuario.email},function(err, usu){
        if(err)
            console.log(err);
        if(usu.email!='')
            return true;
        else
            return false;
           })
}

/**
 * esta cadastrando usuario.
 * falta verificar se o usuario existe antes de cadastrar
 * o email é unico
 */
exports.registro = function(req, res){
  var keys = Object.keys(req.body);
  var params = JSON.parse(keys);

    var usuario = new UsuarioModel(params);
    console.log(usuario);
    usuario.save(function(err){
        if(err){
          console.log(err);
          res.json({success:false});
        }

        res.json({success:true});
    });
};

exports.usuario_listar_todos = function(req, res){
    UsuarioModel.find({},function(err, usuarios){
        res.json(usuarios);
    });
};
