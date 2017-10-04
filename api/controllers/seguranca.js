'use strict';
var jwt = require('jsonwebtoken');
var moment = require('moment');
var UsuarioModel = require('./../models/UsuarioModel');
var config = require('./../config/database');
exports.autenticar = function(req, res){
   var keys = Object.keys(req.body);
    var params = JSON.parse(keys);

//busca um usuario
    UsuarioModel.findOne({email:params.email}, function(err, usuario){
            if(err) console.log(err);

            if(!usuario){
                res.json({success: false, message:"Falha na autenticação: Usuário não encontrado."});
            }else if(usuario){
                if(usuario.senha != params.senha){
                    res.json({success: false, message:"Falha na autenticação: Sua senha não confere."});
                }else{
                    var expires = moment().add(7,'days').valueOf();
                    usuario.senha='';
                    var token = jwt.sign({usuario: usuario, exp:expires}, config.secret);

                    res.json({
                        success: true,
                        message: 'Segue seu token!',
                        token: token
                    });

                }
            }


    })
}

//verificar token
exports.validaToken = function(req,res, next){
    var keys = Object.keys(req.body);
    var params = JSON.parse(keys);
    var token = (params && params.token) || (req.query &&
        req.query.token) || req.headers['x-access-token'];
        if(token){
                var decoded = jwt.verify(token, config.secret, function(err, decoded){
                    if(err)
                     res.status(401).json({success:false, message:'Erro: Seu token é invalido'});
                   // res.send(decoded);
                     if(decoded.exp <= Date.now()){
                        res.json(400, {success:false,message: 'Acesso Expirado, faça login novamente'})
                    }
                    UsuarioModel.findOne({email:decoded.email}, function(err, usu){
                        if(err)
                        usu.senha='';
                        res.json({success:true, usuario:usu});
                    });

            });
        }else {
           res.json(401, {success:false,message: 'Token não encontrado ou informado'})
          }


}
