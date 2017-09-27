'use scritc';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PesquisaSchema = new Schema({

    termo:{
        type: String,
        required: true
    },
    localizacao: {
        cidade:{
            type: String,
            default:'todos'
        },
        uf:{
            type: String,
            default:'todos'
        }
    },
    usuario:{
        type: String
    },
    created: {
        type: Date, 
        default: Date.now 
    }
});

PesquisaSchema.index({usuario:1})
module.exports = mongoose.model('pesquisas', PesquisaSchema);