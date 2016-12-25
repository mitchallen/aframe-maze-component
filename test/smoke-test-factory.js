/**
    Module: @mitchallen/aframe-maze-component
      Test: smoke-test-factory
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    modulePath = "../index-factory";

describe('module factory smoke test', () => {

    var _factory = null;

    before( done => {
        // Call before all tests
        delete require.cache[require.resolve(modulePath)];
        _factory = require(modulePath);
        done();
    });

    after( done => {
        // Call after all tests
        done();
    });

    beforeEach( done => {
        // Call before each test
        done();
    });

    afterEach( done => {
        // Call after eeach test
        done();
    });

    it('module should exist', done => {
        should.exist(_factory);
        done();
    })

    it('create method with no spec should return null', done => {
        var obj = _factory.create();
        should.not.exist(obj);
        done();
    });

    it('create method with spec should return object', done => {
        var obj = _factory.create({});
        should.exist(obj);
        done();
    });

    it('health method should return ok', done => {
        var obj = _factory.create({});
        should.exist(obj);
        obj.health().should.eql("OK");
        done();
    });
});
