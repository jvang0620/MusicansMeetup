const model = require('../models/user');
const Event = require('../models/event');

exports.new = (req, res)=>{
    return res.render('./user/new.ejs');
};

exports.create = (req, res, next)=>{

    let user = new model(req.body);
    user.save()
    .then(user => {
        req.flash('success', 'Registration Succeeded!');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }
        if(err.code === 11000) {
            req.flash('error', 'Email Has Been Used!');  
            return res.redirect('/users/new');
        }
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong Email Address!');  
            res.redirect('/users/login');
        } 
        else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You Have Successfully Logged In!');
                    res.redirect('/'); //landing page
                } 
                else {
                req.flash('error', 'Incorrect Password!');      
                res.redirect('/users/login');
                }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), Event.find({host: id})])
    .then(results => {
        const [user, events] = results;
        res.render('./user/profile', {user, events});
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };


