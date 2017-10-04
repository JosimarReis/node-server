'use scritc';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnunciosAntigosSchema = new Schema({

   anuncios:{
        type: Array
    },
    created: {
        type: Date, 
        default: Date.now 
    }
});


module.exports = mongoose.model('anunciosAntigos', AnunciosAntigosSchema);