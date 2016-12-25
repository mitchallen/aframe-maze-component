/**
    Module: @mitchallen/aframe-maze-component
      Test: smoke-test-factory-derived
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    modulePath = "../index-factory-derived";

describe('module factory smoke test', function() {

    var _factory = null;

    before(function(done) {
        // Call before all tests
        delete require.cache[require.resolve(modulePath)];
        _factory = require(modulePath);
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

    it('module should exist', function(done) {
        should.exist(_factory);
        done();
    })

    it('create method with no spec should return null', function(done) {
        var obj = _factory.create();
        should.not.exist(obj);
        done();
    });

    it('create method with spec should return object', function(done) {
        var obj = _factory.create({});
        should.exist(obj);
        done();
    });

    it('health method should return ok', function(done) {
        var obj = _factory.create({});
        should.exist(obj);
        obj.health().should.eql("OK");
        done();
    });
});
