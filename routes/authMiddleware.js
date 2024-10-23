module.exports.isAuth = (req, res, next) => {
    if( req.isAuthenticated() ){
        next();
    }else{
        res.render('error', {error: 'Not authorized to see this resource, please log in'} );
    }
}

module.exports.isAdmin = (req, res, next) => {
    if( req.user.status == 2 ){
        next();
    }else{
        res.render('error', {error: 'Not authorized to see this resource, only for admins'} );
    }
}

