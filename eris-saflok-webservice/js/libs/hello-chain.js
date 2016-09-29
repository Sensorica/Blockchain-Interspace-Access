
var fs = require('fs');
var EventEmitter = require('events');
var util = require('util');
var async = require('async');

var logger = require(__libs+'/eris-logger');
var eris = require(__libs+'/eris-wrapper');

require('./message');
var net = require('net');
var HOST = '127.0.0.1';
var PORT = 6969;

var saflokMessage = message;

(function() {

    var log = logger.getLogger('eris.hello.chain');

    var events = {NEW_MESSAGE: "newMessage"};

    // Set up event emitter
    function ChainEventEmitter() {
        EventEmitter.call(this);
    }
    util.inherits(ChainEventEmitter, EventEmitter);
    var chainEvents = new ChainEventEmitter();

    // ##############
    // The following part depends on local files that are generated during contract deployment via EPM
    // ##############
    var epmData = require(__contracts+'/epm.json');
    var messageFactoryAbi = JSON.parse(fs.readFileSync(__contracts+'/abi/SaflokManager'));
    var messageAbi = JSON.parse(fs.readFileSync(__contracts+'/abi/Saflok'));

    // Instantiate connection
    var erisWrapper = new eris.NewWrapper( (__settings.eris.chain.host || 'localhost'), (__settings.eris.chain.port || '1337') );
    // Create contract objects
    var saflokManager = erisWrapper.createContract(messageFactoryAbi, epmData['SaflokManager']);
    var saflokContract = erisWrapper.createContract(messageAbi, epmData['Saflok']);

    // Event Registration
    saflokManager.NewSaflokKey(
        function (error, eventSub) {
            if(error) { throw error; }
            //eventSubNew = eventSub; // ignoring this for now
        },
        function (error, event) {
            if(event) {
                chainEvents.emit(events.NEW_KEY, event.args.contractAddress, eris.hex2str(event.args.id),
                    eris.hex2str(event.args.expiryDate), eris.hex2str(event.args.expiryTime), eris.hex2str(event.args.room));
            }
        });

    /**
     * The init function can be used to perform further configuration on contracts
     * @param callback
     */
    var init = function(callback) {
        // nothing to do here
        callback(null);
    }

    /**
     * Adds a single deal to the chain
     * @param deal
     * @param callback
     */
    var createSaflokKey = function(saflokKey, callback) {
        saflokManager.createSaflokKey(eris.str2hex(saflokKey.id), eris.str2hex(saflokKey.expiryDate),
                        eris.str2hex(saflokKey.expiryTime), eris.str2hex(saflokKey.room), function(error, result) {
            log.debug('Created new saflok id: '+saflokKey.id+', expiry date:'+saflokKey.expiryDate+', expiry time: '+saflokKey.expiryTime+', room: '+saflokKey.room);
            callback(error);
        });
    };

    /**
     * Retrieves all registered deals from the DealManager contract.
     * This function is very expensive and might not perform well for large numbers of deals
     * @param callback
     */
    var getSaflokKeys = function(callback) {

        var idx = 0;
        var addresses = [];
        function collectSaflokAddresses () {
            saflokManager.valueAtIndexHasNext(idx, function(error, result) {
                if (error) { throw error; }
                if(result[0] != 0) {
                    addresses.push(result[0]);
                }
                idx = result[1];
                // keep reading ...
                if(idx > 0) { collectKeyAddresses(); }
                // ... or hand over to start collecting data
                else {
                    log.info('Found '+addresses.length+' saflok addresses.');
                    createSaflokKeyObjects(addresses)
                }
            });
        }
        collectSaflokAddresses();

        function createSaflokKeyObjects(addresses) {
            var saflokKeys = [];
            async.each(addresses, function iterator(addr, callback) {
                log.debug('Retrieving saflok data for address: ' + addr);
                saflokContract.at(addr, function(error, contract) {
                    if (error) {
                        // ignoring error for now in order to continue with other contracts
                        log.error('Failure to access contract at address '+addr+': '+error);
                    }
                    else {
                        createSaflokKeyFromContract(contract, function (err, saflokKey) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                saflokKeys.push(saflokKey);
                                callback();
                            }
                        });
                    }
                });
            }, function(err) {
                if(err) {
                    log.error('Reading of saflok data aborted due to unexpected error: '+err);
                }
                else {
                    callback(err, saflokKeys);
                }
            });
        }
    };

    /**
     * Returns a deal object to the callback initialized with the data from the contract at the given address
     * @param address
     * @param callback
     */
    var getSaflokKeyAtAddress = function(address, callback) {
        saflokContract.at(address, function(error, contract) {
            if (error) { throw error; }
            createSaflokKeyFromContract(contract, callback);
        });
    }

    /**
     * Initializes a deal object from the given contract
     * @param contract
     * @param callback
     */
    function createSaflokKeyFromContract(contract, callback) {
        var saflokKey = {};
        async.parallel({
            id: function(callback){
                    contract.id( eris.convertibleCallback(callback, eris.hex2str) );
                },
            expiryDate: function(callback){
                contract.expiryDate( eris.convertibleCallback(callback, eris.hex2str) );
            },
            expiryTime: function(callback){
                contract.expiryTime( eris.convertibleCallback(callback, eris.hex2str) );
            },
            room: function(callback){
                //contract.room( function(err, res) {
                contract.room( eris.convertibleCallback(callback, eris.hex2str) );
                    //callback(err, res['c'][0]); // no fucking idea why it comes back in this structure!
                
            }
        },
        function(err, results) {
            if(err) { callback(err, saflokKey) }
            saflokKey = results;
            saflokKey.contractAddress = contract.address;
            callback(null, saflokKey);
        });
    }

    module.exports = {
        'init': init,
        'events': events,
        'listen': chainEvents,
        'createSaflokKey': createSaflokKey,
        'getSaflokKeys': getSaflokKeys,
        'getSaflokKeyAtAddress': getSaflokKeyAtAddress
    }

}());