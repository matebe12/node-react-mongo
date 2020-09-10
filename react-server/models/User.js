const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxLength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    let user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err) return next(err);
            bcrypt.hash(user.password, salt, (err, hash) =>{
                if(err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
    
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    let password = this.password;
    console.log(plainPassword);
    bcrypt.compare(plainPassword, password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    user = this;
    let token = jwt.sign(user._id.toHexString(), 'secretToken')
    this.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.statics.findByToken = function(token, cb) {
    let user = this;
    //토큰 복호화
    jwt.verify(token, 'secretToken', function(err,decoded) {
      User.findOne({'_id':decoded, 'token': token}, function (err,user) {
        if(err) return cb(err);
        cb(null,user)
      })  
    })
}

const User = mongoose.model('User', userSchema);
module.exports = {User};