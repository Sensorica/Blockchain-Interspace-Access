
var loki = require('lokijs');
var EventEmitter = require('events');
var util = require('util');
var logger = require('./eris-logger');
var chain = require('./hello-chain');
var saflokRequest = require('./api');


(function() {

    var log = logger.getLogger('eris.hello.db');

    // Set up event emitter
    var events = {NEW_KEY: 'createSaflokKey'};
    function DbEventEmitter() {
        EventEmitter.call(this);
    }
    util.inherits(DbEventEmitter, EventEmitter);
    var dbEventEmitter = new DbEventEmitter();

    // Set up Loki DB
    _db = new loki();
    _collection = _db.addCollection('saflokKeys', {indices: ['id', 'expiryDate', 'expiryTime', 'room']});
    _collection.ensureUniqueIndex('contractAddress');

    // Register for events from chain module
    chain.listen.on(chain.events.NEW_KEY, function (address, id, expiryDate, expiryTime, room) {
        log.info('New saflok key detected ('+id+':'+expiryDate+':'+expiryTime+':'+room+') with address: '+address);
        log.info('Calling Saflok Interface');
        saflokRequest.sendSaflokKey (log.info('Sent command to Saflok interface'));
        // Loading deal freshly from chain as there might be more data than conveyed in the event
        chain.getSaflokKeyAtAddress(address, function(err, saflokKey) {
            if(err) { throw err; }
            log.debug('Performing DB insert for new saflok key with address '+saflokKey.contractAddress)
            _collection.insert(saflokKey);
            // emit two events! One carries the ID of the deal, so it can be specifically detected
            dbEventEmitter.emit(events.NEW_KEY, saflokKey);
            dbEventEmitter.emit(events.NEW_KEY+'_'+saflokKey.id, saflokKey);
        });
    })

    /**
     * @param library
     * @param callback
     */
    function loadSaflokKeys(callback) {
        chain.getSaflokKeys( function(error, saflokKeys) {
            log.info('Storing '+saflokKeys.length+' saflok keys from chain in DB.');
            _collection.removeDataOnly();
            _collection.insert(saflokKeys);
            callback(null);
        });
    }

    /**
     * Refreshes the DB
     * @param callback
     */
    function refresh(callback) {
        loadSaflokKeys(callback);
    }

    function getSaflokKey(id) {
        log.debug('Retrieving deal from DB for ID: ' + id);
        return _collection.findOne({'id': id});
    }

    function getSaflokKeys(expiryDate, expiryTime) {
        log.debug('Retrieving deals from DB using parameters expiry date: '+expiryDate+', expiry time: '+expiryTime);
        var queryParams = createQuery(expiryDate, expiryTime);
        // Use AND for multiple query params
        if (queryParams.length > 1) {
            return _collection.find({'$and': queryParams});
        }
        else if (queryParams.length == 1) {
            return _collection.find(queryParams[0]);
        }
        else {
            // for 'undefined' query all documents in the collection are returned
            return _collection.find();
        }
    }

    function createSaflokKey(saflokKey, callback) {
        // TODO check if deal exists in DB
        chain.createSaflokKey(saflokKey, callback);
    }

    /*
        Helper method to create a query object for LokiJS' search
     */
    function createQuery(expiryDate, expiryTime) {
        var queryParams = [];
        if (expiryDate) {
            queryParams.push({'expiryDate': expiryDate});
        }
        if (expiryTime) {
            queryParams.push({'expiryTime': expiryTime});
        }
        return queryParams;
    }

    module.exports = {
        'events': events,
        'listen': dbEventEmitter,
        'refresh': refresh,
        'getSaflokKey': getSaflokKey,
        'getSaflokKeys': getSaflokKeys,
        'createSaflokKey': createSaflokKey
    };

}());