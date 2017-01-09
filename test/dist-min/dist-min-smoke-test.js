/**
    Module: @mitchallen/aframe-maze-component
      Test: smoke-test-dist-min
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    modulePath = "../../dist/aframe-maze-component.min";

describe('dist min smoke test', () => {

    var script = null;

    before( done => {
        // Call before all tests
        delete require.cache[require.resolve(modulePath)];
        script = require(modulePath);
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

    it('script should exist', done => {
        should.exist(script);
        done();
    })
});
