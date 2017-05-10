// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
import { Router, Request, Response } from 'express';
import * as express from 'express';
import * as exprhandlebars from 'express-handlebars';
import * as config from './config';

let app = express();
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

Object.keys(config.services).forEach((path) => {
    app.use(path, config.services[path].router);
})
app.get('/test-app', function(request, response) {
    response.render('pages/test-app/home', { layout: 'angular_base' });
})
app.use('/', express.static('./build/client'));
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