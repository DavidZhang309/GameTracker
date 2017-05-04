// for missing Promises support
if (global.Promise == null) {
    global.Promise = require('promise');
}

//lib
import { OSURouter } from './middleware/OSURouter'
var express = require('express');
var exprhandlebars = require('express-handlebars');

let app = express();
app.engine('handlebars', exprhandlebars({}));
app.set('views', './build/templates');
app.set('view engine', 'handlebars');

let osuRouter = new OSURouter();
app.use('/osu', osuRouter.router);
app.use('/app', express.static('./build/client'));

app.listen(5590, function(){
    console.log('started');
})