//lib
var express = require('express');

import { OSUDataService } from './services/OSUDataService';

let app = express();
let OSUSvc = new OSUDataService();

app.get('/osu/beatmaps', function(request, response){
    // parse request
    let beatmaps = request.query.b;
    if (beatmaps == null) {
        response.send([]);
        return;
    } else if (!Array.isArray(beatmaps)) {
        beatmaps = [request.query.b];
    }
    
    OSUSvc.getBeatmaps(beatmaps, function(data) {
        response.send(data);
    });
});

app.use('/app', express.static('./build/client'));

app.listen(5590, function(){
    console.log('started');
})