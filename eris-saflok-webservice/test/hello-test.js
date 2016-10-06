
var expect    = require("chai").expect;
var app = require("../app.js");
var chain = require("../js/libs/hello-chain");
var db = require("../js/libs/hello-db");

describe("Saflok Key Request Test", function() {

    this.timeout(5000); // 5 sec timeout to account for block commit delay

    it("Module Initialization", function(done) {
        chain.init(function(error) {
            expect(error).to.be.null;
            db.refresh(function(error) {
                expect(error).to.be.null;
                done();
            });
        });
    });

    describe("Creat Saflok Key", function() {

        var key1 = {id: '001', expiryDate: '010120', expiryTime: '13:00', room: 'A101'};

        it("Add Deal", function(done) {
            chain.createSaflokKey(key1, function (error) {
                expect(error).to.be.null;
                chain.getSaflokKeys(function (error, saflokKeys) {
                    expect(error).to.be.null;
                    expect(saflokKeys.length).to.equal(1);
                    expect(saflokKeys[0].id).to.equal(key1.id);
                    expect(saflokKeys[0].expiryDate).to.equal(key1.expiryDate);
                    expect(saflokKeys[0].expiryTime).to.equal(key1.expiryTime);
                    expect(saflokKeys[0].room).to.equal(key1.room);
                    done();
                });
            });
        });

        after( function(done) {
            //TODO remove keys created in tests. Use a fresh chain for now to test!
            done();
        });

    });

});

