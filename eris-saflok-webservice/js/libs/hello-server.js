

var fs = require('fs');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var logger = require(__libs+'/eris-logger');
var chain = require(__libs+'/hello-chain');
var db = require(__libs+'/hello-db');

(function() {

    var log = logger.getLogger('eris.hello.server');

    var portHTTP = __settings.eris.server.port_http || 3080;
    var app = express();

    // Configure PORTAL
    app.use('/'+(__settings.eris.server.contextPath || 'hello-eris'), express.static(__dirname + '/ui'));

    // Configure JSON parsing as default
    app.use(bodyParser.json());

    /**
     * DEALS
     */

    // GET muliple
    app.get('/saflokKey', function(req, res) {
        res.json( db.getSaflokKeys(req.query.expiryDate, req.query.expiryTime) );
    });

    // GET single
    app.get('/saflokKey/:id', function(req, res) {
        res.json( db.getSaflokKey(req.params.id) );
    });

    // POST new saflok key
    app.post('/saflok', function(req, res) {
        var key = req.body;
        chain.createSaflokKey(key, function(error) {
            // needs timeout!
            db.listen.once( db.events.NEW_SAFLOK+'_'+key.id, function(key) {
                res.sendStatus(200);
            });
        });
    });

    var httpServer = http.createServer(app).listen(portHTTP);

}());
