// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
import { Router, Request, Response } from 'express';
import * as express from 'express';
import * as exprhandlebars from 'express-handlebars';
import * as config from './config';

//temp
import * as passport from 'passport';
import * as passport_local from 'passport-local';
let LocalStrategy = passport_local.Strategy;

let app = express();
// Template engine configuration
app.engine('handlebars', exprhandlebars({
    defaultLayout: 'main',
    layoutsDir: './app/templates/layouts/',
    partialsDir: './app/templates/partials/',
    helpers: {
        footer_script: function(options) {
            this._footer_scripts = options.fn(this);
            return null;
        },
        round_number: function(num: string, amount: any) {
            return parseFloat(num).toFixed(parseInt(amount));
        }
    }
}));
app.set('views', './app/templates');
app.set('view engine', 'handlebars');

// routing authentication
app.use(passport.initialize());
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'passw'
    }, function(user, pass, done) {
        done(null, false, { message: "Not possible to authenticate" });
    }
));
app.get('/auth/login', (request, response) => {
    response.render('pages/auth/login', { });
});
app.post('/auth/api/login', passport.authenticate('local', { 
        failureRedirect: '/auth/login'
    }), (request, response) => {
        response.redirect('/');
    }
);

// routing services
Object.keys(config.services).forEach((path) => {
    app.use(path, config.services[path].router);
})
app.get('/test-app', function(request, response) {
    response.render('pages/test-app/home', { layout: 'angular_base' });
})
//static files
app.use('/', express.static('./build/client'));
// 404 handling
app.use('/', function(request, response, next) {
    response.statusCode = 404;
    if ((<any>request).is_api) {
        response.send({
            error: "unknown request"
        })
    } else {
        response.render("pages/404");
    }
});
// Server error handler (500)
app.use(function(error: Error, request: Request, response: Response, next) { //error
    response.statusCode = 500;
    if ((<any>request).is_api) {
        response.send({
            error: config.detailed500error ? error.message : config.generic500error
        });
    } else {
        response.render('pages/500', {
            error: config.detailed500error ? error.stack : config.generic500error
        })
    }
    
});

app.listen(5590, function(){
    console.log('started');
})