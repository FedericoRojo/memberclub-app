const pool = require("../config/pool");
const {body, validationResult} = require("express-validator");
const {genPassword} = require("../lib/passwordUtils");
const passport = require("passport");


const alphaErr = "must only contain letters";

const validateUser = [
    body("username").trim()
        .isAlpha().withMessage(`First name ${alphaErr}`),
    body("name").trim()
        .isAlpha().withMessage(`Name ${alphaErr}`),
    body("password")
        .trim(),
    body("confirm-password")
        .trim()
        .custom( (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true; 
        })
];


const registerUser = [
    validateUser,
    async (req, res, next) =>  {
        const saltHash = genPassword(req.body.password);

        const salt = saltHash.salt;
        const hash = saltHash.hash;

        try{
            const newUser = await pool.query("INSERT INTO users(name, username, hash, salt, status) VALUES ($1, $2, $3, $4, $5) RETURNING name, username;", [req.body.name, req.body.username, hash, salt, 0])
            
            res.redirect('/');
        }catch(e){
            res.render('registerUser', {error: e.message});
        }
    }
]

function getRegisterUser (req, res, next){
    res.render('registerUser', {error: null});
}

async function getHome (req, res, next){ // 0=baseUser, 1=member, 2=admin
    let isMember = 0;
    const {rows} = await pool.query('SELECT m.title, m.text, m.creation, u.username, m.id FROM messages m JOIN users u ON m.iduser = u.id');
    if( req.user != null ){
        if(req.user.status == 2){
            isMember = 2;
        }else if(req.user.status == 1){
            isMember = 1
        }
    }
    res.render('home', {error: null, isMember: isMember, messages: rows});
}

function getJoinClub (req, res, next){
    res.render('joinclub', {error: null});
}

async function joinClub(req,res){
    const passkey = req.body.passkey;
    if( passkey == process.env.PASS_KEY){
        try{
            await pool.query('UPDATE users SET status = 1 WHERE id = $1', [req.user.id]);
            res.redirect('/');
        }catch(e){
            res.render('joinclub', {error: e.message});
        }
    }else{
        res.render('joinclub', {error: 'The passkey entered is incorrect'});
    }
}


function getAdmin (req, res, next){
    res.render('admin', {error: null});
}

async function admin(req,res){
    const passkey = req.body.passkey;
    if( passkey == 'admin'){
        try{
            await pool.query('UPDATE users SET status = 2 WHERE id = $1', [req.user.id]);
            res.redirect('/');
        }catch(e){
            res.render('admin', {error: e.message});
        }
    }else{
        res.render('admin', {error: 'The passkey entered is incorrect'});
    }
}

function getLogin(req, res){
    if(req.user == null){
        return res.render('loginUser', {error: null});    
    }else{
        return res.render('error', {error: 'Your are already logged in, pleaso log out to log in'})
    }
    
}

function login(req, res, next){
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.render('loginUser', {error: 'Error while authenticating'});
        }
        if (!user) {
            return res.render('loginUser', { error: 'Error in authentication, password or username incorrect' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.render('loginUser', {error: 'User authenticated but some error occur'});
            }
            return res.redirect('/');
        });
    })(req, res, next);
}

function logout(req, res, next) {
    
    req.logout((err) => { 
        
        if (err) {
            return res.render('error', { error: 'Error while loging out' });;  
        }
        
        req.session.destroy((err) => {
            if (err) {
              return res.render('error', { error: 'Error destroying session' });
            }
            res.clearCookie('connect.sid');  
            res.redirect('/'); 
        });
    }); 
};

function getCreateMessage(req, res){
    console.log('getCreateMessage', req);
    res.render('createMessage', {error: null});
}

async function createMessage(req, res){
    
    try{
        
        await pool.query('INSERT INTO messages(idUser, title, text, creation) VALUES ($1, $2, $3, NOW())', [req.user.id, req.body.title, req.body.text]);
        res.render('createMessage', {error: 'Message correctly created'});
    }catch(e){
        res.render('createMessage', {error: e.message});
    }

}

async function deleteMessage(req, res){
    const messageId = req.params.id;
    try{
        await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
        res.redirect('/');
    }catch(e){
        res.render('error', {error: 'Error while trying to delete message'});
    }
}


module.exports = {
    registerUser,
    getRegisterUser,
    getHome,
    getJoinClub,
    joinClub,
    getLogin,
    login,
    logout,
    getCreateMessage,
    createMessage,
    getAdmin,
    admin,
    deleteMessage
}
