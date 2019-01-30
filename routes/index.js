var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var product = require('../models/product');
var passport= require('passport');
require('../config/passport')(passport);
var bcrypt = require('bcryptjs');
var usermodel = require('../models/user');
var Cart = require('../models/cart');
var Order = require('../models/order');
var multer = require('multer');


//Mullter Middleware
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});

var upload = multer({ storage: storage }).single('myimage');



mongoose.connect('mongodb://localhost/test');
var db=mongoose.connection;
db.once('open',function(){console.log("connected to database");});
db.on('error',function(err){console.log(err);});

/* GET home page. */

router.get('/', function(req, res, next) {
    product.find().then(function (data) {
        res.render('shop/index', {products: data});
    });
});



router.get('/signup', function(req,res,next) {
    res.render('user/signup');
});

router.post('/signinup', function(req,res,next)
{
    var errors2 = [];

    if(req.body.password !== req.body.password2)
    {
        errors2.push({text:'Passwords do not match'});
    }

    if(req.body.password.length < 2 )
    {
        errors2.push({text:'Password must be at least 2 characters'});
    }

    if(errors2.length > 0)
    {

        res.render('user/signup',
            { errors2:errors2, username: req.body.username, email:req.body.email,  phone:req.body.phone, password:req.body.password, password2:req.body.password2});
    }
    else {
        usermodel.findOne({email: req.body.email}).then(function(user)
        {
            if(user)
            {
                req.flash('error_msg', 'Email already regsitered ,Try with some other');
                res.redirect('/signup');
            }
            else
            {
                var newUser = new usermodel({name: req.body.username, email: req.body.email, password: req.body.password,phone:req.body.phone,role:"user"});

                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(newUser.password, salt, function(err, hash)  {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save().then(function(user) {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/signin');
                        })
                            .catch(function(err) {
                                console.log(err);
                                return;
                            });
                    });
                });
            }
        });
    }
});



router.get('/signin',function(req,res,next)
{

    res.render('user/signin');

});

router.post('/adminlogged', passport.authenticate('local',
    {
        // successRedirect:'/adminview',
        failureRedirect: '/signin',
        failureFlash: true
    }),function(req, res, next) {
        if(req.session.url){
            oldurl=req.session.url;
            req.session.url = null;
            console.log('REDIRECTING TO URL');
    res.redirect(oldurl);}
    else{res.redirect('/adminview');}
 }
);


router.get('/adminview',ensureAuthentication, function(req, res, next) {
    if(req.user.role=='admin')
    {
    res.render('shop/adminview');
    }
    else {
        res.redirect('/');
    }
});

router.get('/productmanagement', function(req, res, next) {
    product.find().then(function(data){
        res.render('shop/productmanagement'  , {products:data});
    })

});

router.get('/update', function(req, res, next) {
    res.render('shop/update')});


router.get('/add', function(req, res, next) {
    res.render('shop/addnew')});



router.post('/addnew',function(req,res,next){
    upload(req, res, function (err) {
        if(err)
        {
            throw err;
            console.log("error occured while uploading ");
        }
        else{
            console.log(req.file);
            var newpro = new product;

            newpro.title = req.body.title;
            newpro.description = req.body.description;
            newpro.price = req.body.price;
            console.log(req.file);
            newpro.save();

            res.redirect('/');
            }
    });
});


router.get('/delete/:id',function(req,res,next)
{
    var id = req.params.id;
    product.findOneAndRemove({_id:id}).then(function(doc){
        if(doc){
            console.log('Congratulations this Product is removed:   ' +doc);
            req.flash('success_msg', 'YOUR Product HAS BEEN DELETED !');
            res.redirect('/adminview');
        }
    })
});



router.get('/update/:id',function(req,res,next)
{
    var id = req.params.id;
    product.findOne({_id:id}).then(function (doc,err)  {

        if(err)
        {
            console.log('We canT match id with database to edit');
            req.flash("error_msg","Product Not Find");
            console.log(err);
            res.redirect('/adminview');
        }
        else {
            // console.log(doc);
            res.render('shop/update',{s:doc});
        }
    })

});


router.post('/updated/:id',function(req,res,next)
{

    product.findOne({_id: req.params.id}).then(function(doc ) {
        // new values
        doc.title = req.body.title;
        doc.description = req.body.description;
        doc.price  = req.body.price;
                doc.save().then(function(idea){
            req.flash('success_msg', 'YOUR BLOG HAS BEEN EDITED !');
            res.redirect('/adminview');})
    });
});


router.get('/addtocart/:id',function(req,res,next)
{
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    product.findOne({_id:req.params.id}).then(function(product1)
        {
            console.log("THIS IS THE PRODUCT TO BE ADDED",product1);

            cart.add(product1,product1._id);
            req.session.cart = cart;
            console.log(req.session.cart);
            res.redirect('/');
        });
});

router.get('/cartview',function(req,res,next){
    if(!req.session.cart){
        req.flash('error_msg','Nothing in Your cart');
        res.redirect('/');}
        else
            {

        var cartview = new Cart(req.session.cart);
        res.render('shop/cartview',{totalprice:cartview.totalprice, cartproduct: cartview.generateArray()})

    }

});

router.get('/check',ensureAuthentication,function(req,res,next){
    if(!req.session.cart) {
        req.flash('error_msg', "Nothing in yo ur cart . SHOP NOW !!");
        res.render('shop/index');
    }
 else{
       var cart = new Cart(req.session.cart);
        res.render('shop/checkout',{total:cart.totalprice});
    }
});


router.post('/ordering',function(req,res,next){

    var order = new Order();
    order.cart = req.session.cart;
        order.address = req.body.address;
        order.name = req.body.name;
        order.Phone = req.body.number;

            order.save().then(function(result){
                if(result){
                    console.log("Order saved ! Now routing");
                    req.flash('success_msg', 'Congratulations ! YOUR ORDER IS SENT !');

                    product.find().then(function (data)
                    {
                        res.render('shop/index',{sent:true,products: data});
                    });
                }

                });
        });



function ensureAuthentication(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else {
        req.flash("error_msg",'SIGN IN fRIST BEFORE CHECK OUT !');

        req.session.url=req.url;
    res.redirect('/signin')}
}

router.get('/yourorder',function(req,res,next){
   res.render('user/yourorder');
});



module.exports = router;
