const {User} = require('../models/User');
let auth = (req, res, next) => {
    //인증 처리

    //쿠키에서 토큰을 가져온다
    let token = req.cookies.x_auth;
    // 토큰 복호화 후 찾음
    User.findByToken(token, (err, user) => {
        if(err) return err;
        if(!user) return res.json({isAuth: false, error: true});
        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = {auth};