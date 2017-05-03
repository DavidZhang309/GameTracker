//lib
import { OSURouter } from './middleware/OSURouter'
var express = require('express');

let app = express();

let osuRouter = new OSURouter();

app.use('/osu', osuRouter.router);
app.use('/app', express.static('./build/client'));

app.listen(5590, function(){
    console.log('started');
})