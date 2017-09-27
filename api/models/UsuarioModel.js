var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var usuarioSchema = new Schema({ 
    _id:{
        type:String
    },
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    }, 
    senha: {
        type: String,
        required: true
    }, 
    admin: {
        type: Boolean,
        default: false
    },
    situacao:{
        type: Boolean,
        default:true
    },
    created: {
        type: Date, 
        default: Date.now 
    }
}) ;

usuarioSchema.pre('save',function(next){
    var usuario = this;

    if (this.isModified('senha') || this.isNew){
        bcrypt.genSalt(10, function(err, salt){
            if(err) {
                return next(err);
            }
            bcrypt.hash(usuario.senha, salt,function(err, hash){
                if(err) {
                    return next(err);
                }
                usuario.senha = hash;
                next();
            });
        })
    }else{
        return next();
    }
});

usuarioSchema.methods.compareSenha = function(senha, cb){
    bcrypt.compare(senha, this.senha, function(err, isMatch){
        if(err){
            next(err);
        }
        cb(null, isMatch);
    });
}


//usuarioSchema.plugin(uniqueValidator);
module.exports =  mongoose.model('usuarios', usuarioSchema);