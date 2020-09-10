const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 5000;
const cookieParser = require('cookie-parser')
const {auth} = require('./middleware/auth')
const mongoose = require('mongoose')
const mongoKey = 'mongodb+srv://matebe12:fndlwm12@boilerplate.5wgrw.mongodb.net/<dbname>?retryWrites=true&w=majority';
const {User} = require('./models/User.js');
//클라이언트에서 보낸 데이터를 분석해서 가져올수 있게 필요.
//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());
//db
mongoose.connect(mongoKey, {
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify:false
}).then(() => console.log('Db is connected'));

//router
app.get('/', (req, res) => res.send('Hello World'))
app.post('/api/user/register', (req, res) => {
    const user = new User(req.body);
    
    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err});
        return res.status(200).json({
            success:true
        })
    })
})

app.post('/api/user/login', (req,res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if(!user){
            return res.json({
                loginSuccess: false,
                message: '등록된 아이디가 아닙니다.'
            });
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            
            if(!isMatch)
            return res.json({loginSuccess: false, message: '비밀번호가 틀렸습니다.'});
            
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                res.cookie('x_auth', user.token).status(200).json({loginSuccess: true, userId: user.id});
                
            })
        })
    })
})

app.get('/api/user/auth',auth, (req,res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
});

app.get('/api/user/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id},
            {token: ''},
            (err, user) => {
                if(err) return res.json({success: false, err});
                return res.status(200).send({
                    success:true
                })
            }
        )
})


app.listen(port, () => console.log('Server On Port = ' + port));