// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
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
    app.use(path, config.services[path].router)
})
app.use('/', express.static('./build/client'));

app.listen(5590, function(){
    console.log('started');
})