var UsuarioModel = require('../models/UsuarioModel');
//var Session = require('../models/session');
var jwt  = require('jwt-simple');
var config = require('../config/database');
 
var functions = {
    authenticate: function(req, res) {
        UsuarioModel.findOne({
            email: req.body.email
        }, function(err, usuario){
            if (err) throw err;
            if(!usuario){
                return res.status(403).send({success: false, msg: 'Falha na autenticação, usuário não encontrado.'});
            } else {
                usuario.compareSenha(req.body.senha, function(err, isMatch){
                    if(isMatch && !err) {
                        var token = jwt.encode(usuario, config.secret);
                        res.json({success: true, token: token, usuario:{
                            nome: usuario.nome,
                            email: usuario.email,
                            situacao: usuario.situacao,
                            admin: usuario.admin,
                            senha: null,
                            _id: usuario._id
                        }});
                    } else {
                        return res.status(403).send({success: false, msg: 'Autenticação falhou, senha errada.'});
                    }
                })
            }
        })
    },
 
    getinfo: function(req, res){
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'){
            var token = req.headers.authorization.split(' ')[1];
            var decodedtoken = jwt.decode(token, config.secret);
            return res.json({success:true, msg:'Oi ' + decodedtoken.name});
        }
        else {
            return res.json({success: false, msg: 'sem cabeçalho'});
        }
        
        
    }
};
module.exports = functions;