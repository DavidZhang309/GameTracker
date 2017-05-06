// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
import { OSURouter } from './middleware/OSURouter';
import { SteamRouter } from './middleware/SteamRouter';
import * as express from 'express';
import * as exprhandlebars from 'express-handlebars';

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

let osuRouter = new OSURouter();
let steamRouter = new SteamRouter();

app.use('/osu', osuRouter.router);
app.use('/steam', steamRouter.router);
app.get('/', (request, response) => {
    response.render('pages/home');
});
app.get('/profile', (request, response) => {
        response.render('pages/profile_search');
});
app.get('/profile/:id', (request, response) => {
    let user_id = request.params['id'];
    response.render('pages/profile', { entries: [
        {a:1}, {a:2}, {a:3}
    ]});
});
app.use('/', express.static('./build/client'));

app.listen(5590, function(){
    console.log('started');
})