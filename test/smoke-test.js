/**
    Module: @mitchallen/aframe-maze-component
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    modulePath = "../index";

describe('module smoke test', function() {

    before(function(done) {
        // Call before all tests
        done();
    });

    after(function(done) {
        // Call after all tests
        done();
    });

    beforeEach(function(done) {
        // Call before each test
        done();
    });

    afterEach(function(done) {
        // Call after eeach test
        done();
    });

    it('module should callback OK', function(done) {
        delete require.cache[require.resolve(modulePath)];
        let options = {};
        require(modulePath)(options, function(err,data) {
            should.not.exist(err);
            should.exist(data);
            should.exist(data.status)
            data.status.should.eql("OK");
            done();
        });
    });
});
