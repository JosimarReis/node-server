'use scritc';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EstadosSchema = new Schema({

    sigla:{
        type: String,
    },
    nome:{
        type: String,
        },
    cidades:{
        type: String
    }
});


module.exports = mongoose.model('estados', EstadosSchema);