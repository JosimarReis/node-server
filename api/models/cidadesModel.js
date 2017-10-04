'use scritc';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CidadeSchema = new Schema({

    nome:{
        type: String,
    },
    estado:{
            sigla:{
                type:String
            },
            nome:{
                type:String
            }
        },
    cep:{
        type:String,
        default:''
    },    
    geo:{
        latitude:{
            type:String,
            default:''
        },
        longitude:{
            type: String,
            default:''
        }
    }
});

CidadeSchema.index({nome:"text"});

module.exports = mongoose.model('cidades', CidadeSchema);