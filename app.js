var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expresshbs  = require('express-handlebars');
var session = require('express-session');
var mongostore = require('connect-mongo')(session);
var passport = require('passport');
var flash  = require('connect-flash');
var mongoose  = require('mongoose');
var multer = require('multer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs',expresshbs({defaultLayout:'layout',extname:'.hbs'}))
app.set('view engine', '.hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({ secret: "cats",resave: true,
    saveUninitialized: true,
    store : new mongostore({mongooseConnection:mongoose.connection}),
    cookies:{maxAge: 180*60*1000}
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


// Global variables

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg') ;
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.errors2 = req.flash('errors2');
    res.locals.session = req.session;

    res.locals.user = req.user ||null;
    // console.log(res.locals.user);
    next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
