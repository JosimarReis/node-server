'use scritc';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cidadesDistanciasSchema = new Schema({

    origem:{
        type: String,
    },
    destino:{
        type: String,
    },
    distancia:{
        type: String,
    },
    tempo:{
        type: String,
    },
    created: {
        type: Date,
        default: Date.now
    }
  });


module.exports = mongoose.model('cidadesDistancias', cidadesDistanciasSchema);
