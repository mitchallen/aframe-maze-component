/**
    Module: @mitchallen/aframe-maze-component
      Test: smoke-test-module
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    modulePath = "../../modules/index";

describe('module smoke test', () => {

    var module = null;

    before( done => {
        // Call before all tests
        delete require.cache[require.resolve(modulePath)];
        module = require(modulePath);
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
        should.exist(module);
        done();
    })
});
