// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
import { Router, Request, Response } from 'express';
import * as express from 'express';
import * as express_parser from 'body-parser';
import * as express_session from 'express-session';
import * as exprhandlebars from 'express-handlebars';
import * as passport from 'passport';
import * as config from './config';

let app = express();
// Template engine configuration
app.engine('handlebars', exprhandlebars({
    defaultLayout: 'main',
    layoutsDir: './app/server/templates/layouts/',
    partialsDir: './app/server/templates/partials/',
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
app.set('views', './app/server/templates');
app.set('view engine', 'handlebars');

app.use(express_parser.json());
app.use(express_parser.urlencoded());
app.use(express_session({
    secret: 'much secret'
}));

// routing authentication
app.use(passport.initialize());

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

app.listen(config.port, function(){
    console.log('started');
})