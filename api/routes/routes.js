'use strict';

module.exports = function(app){
    var scraper = require('../controllers/scraper');
    var usuarios = require('../controllers/usuarios');
    var seguranca = require('../controllers/seguranca');
    var cidades = require('../controllers/cidades');
    var cidadesDistancia = require('../controllers/cidadesDistancias');
    var anuncios = require('../controllers/anuncios');
    var jwt = require('jsonwebtoken');
    var config = require('./../config/database');
    var actions = require('../actions/method');

    app.use(function (req, res, next) {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);

            // Pass to next layer of middleware
            next();
        });

    app.post('/authenticate', actions.authenticate);
    app.post('/validartoken', seguranca.validaToken);
    app.get('/getinfo', actions.getinfo);

    //TodoList routes
    app.route('/scraper')
    .get(scraper.iniciarColetaRota);

    app.route('/anunciobpk')
    .post(scraper.mongo_bkp_all_anuncio);

    app.route('/api/usuario/registro')
    .post(usuarios.registro);


    //segurança
    app.route('/api/usuario/autenticar')
    .post(seguranca.autenticar);

    /**
     * TODAS AS ROTAS ADICIONAR ABAIXO DA SEGUINTE FUNÇÃO
     * ESTAO COM ACESSOS PROTEGITOS
     *
    app.use(function(req, res, next){
        //checa o token no cabeçalho das solicitacoes
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        //decodifica o token
        if(token){

           jwt.verify(token, config.secret, function(err, decoded){
               if(err){
                   return res.json({
                       success: false,
                       message: 'Falha na autenticação do token.'
                   });
               }else{
                   req.decoded = decoded;
                   next();
               }
           });
        }else{
            return res.status(403).send({
                success: false,
                message: 'Nenhum token foi encontrado.'
            });
        }

    });/** */
    app.route('/api/usuario')
    .get(usuarios.usuario_listar_todos);

    // cidades

    app.route('/api/cidades')
    .post(cidades.listar_cidades_por_estado);
    app.route('/api/importarcidades')
    .post(cidades.importaCidades);
    app.route('/api/geo')
    .post(cidades.cidades_geolocalizacao);
    app.route('/api/distancia')
    .get(cidadesDistancia.calcularDistancias);
    //busca anuncios
    app.route('/api/anuncios')
    .post(anuncios.lista_anuncios_filtrados);
    app.route('/api/historicopesquisa')
    .post(anuncios.lista_historicos_pesquisas);
};
