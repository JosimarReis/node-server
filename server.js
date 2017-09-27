var express = require('express');
var routes = require('./api/routes/routes');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var config = require('./api/config/database');
var usuario = require('./api/models/UsuarioModel');
var passport = require('passport');

//============================
//configuracao da api ========
//============================

//mongoose iniciar uma conexao com o banco de dados
mongoose.Promisse = global.Promise;
mongoose.connect(config.database);
mongoose.connection.on('open',function(){
    console.log('Mongo esta conectado.');
    
    app = express();
    port = process.env.PORT || 3000;
    app.set('superSecret', config.secret);
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    app.use(morgan('dev'));

    /**
     * registra as rotas da api
     */
    routes(app); 
    app.use(passport.initialize());
    require('./api/config/passport')(passport);

    app.use(function(req, res){
        var mensagem = {url:req.originalUrl + ' endereço não encontrado.'};
        console.log(mensagem);
        res.status(404).send({url:req.originalUrl + ' endereço não encontrado.'});
    })


    app.listen(port,function(){
        console.log('Servidor iniciado na porta:' + port);
    });
});