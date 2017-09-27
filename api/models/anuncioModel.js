'use scritc';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnuncioSchema = new Schema({

    titulo:{
        type: String,
        required: "adicione um titulo"
    },
    url:{
        type: String,
        required:"Adicione um endereço"
    },
    imagem:{
        type: String
    },
    localizacao: {
        cidade:{
            type: String
        },
        uf:{
            type: String
        },
        latitude:{
            type: String
        },
        longitude:{
            type: String
        }
    },
    preco:{
        type: String
    },
    descricao:{
        type: String
    },
    anunciante:{
    nome:{
        type: String
    },
    telefone:{
        type: String
    },
    email:{
        type: String
    },
    site:{
        type: String
    }},
    created: {
        type: Date, 
        default: Date.now 
    }
});

AnuncioSchema.index({titulo:"text",descricao:"text"});
module.exports = mongoose.model('Anuncios', AnuncioSchema);