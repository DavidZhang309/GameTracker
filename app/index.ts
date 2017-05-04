// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
import { OSURouter } from './middleware/OSURouter';
import { OSUMockAPIRouter } from './middleware/OSUMockAPIRouter';
import * as express from 'express';
import * as exprhandlebars from 'express-handlebars';

let app = express();
app.engine('handlebars', exprhandlebars({
    defaultLayout: 'main',
    layoutsDir: './app/templates/layouts/' 
}));
app.set('views', './app/templates');
app.set('view engine', 'handlebars');

let osuRouter = new OSURouter();
let osuMockAPI = new OSUMockAPIRouter();

app.use('/osu/api', osuMockAPI.router);
app.use('/osu', osuRouter.router);
app.get('/', (request, response) => {
    response.render('pages/home');
})
app.use('/', express.static('./build/client'));

app.listen(5590, function(){
    console.log('started');
})