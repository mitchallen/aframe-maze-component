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

    var component = {};

    before( done => {
        // Call before all tests
        delete require.cache[require.resolve(modulePath)];
        module = require(modulePath);

        // mock browser document
        global.document = {
            querySelector: function () { return null; },
            getElementById: function (id) { return id === "found" ? {
                getAttribute: function(name) {
                    return {};
                }
            } : null; },
            createElement: function(id) {
                return {
                    setAttribute: function(a) {},
                };
            }
        };

        done();
    });

    after( done => {
        // Call after all tests

        delete global.document;

        done();
    });

    beforeEach( done => {
        // Call before each test
        component = module.Component;
        component.el = {
            appendChild: function(el) {},
        }
        component.data = {};
        // copy defaults from schema
        for(var k in component.schema) {
            var cType = component.schema[k].type;
            switch(cType) {
                case 'vec2':
                    var token = component.schema[k].default.split(',');
                    if( token.length != 2 ) {
                        throw new Error( k, "should contain two parameters ('x y')");
                    }
                    component.data[k] = {};
                    component.data[k].x = parseInt(token[0]);
                    component.data[k].y = parseInt(token[1]);
                    break;
                default:
                    component.data[k] = component.schema[k].default;
                    break;
            }
        } 
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

    it('Component should return component object', done => {
        should.exist(module);
        var component = module.Component;
        should.exist(component);
        done();
    })

    it('component init should succeed', done => { 
        // console.log(component.data);     
        component.init();
        done();
    })

    it('component init should succeed for found wall element', done => { 
        // console.log(component.data); 
        component.data.wall = "found";    
        component.init();
        done();
    })

    it('component init should succeed for found wall element with pound sign starting name', done => { 
        // console.log(component.data); 
        component.data.wall = "#found";    
        component.init();
        done();
    })

    it('component init should succeed for found cap element', done => { 
        // console.log(component.data); 
        component.data.cap = "found";    
        component.init();
        done();
    })

    it('component init should succeed for found cap element with pound sign starting name', done => { 
        // console.log(component.data); 
        component.data.cap = "#found";    
        component.init();
        done();
    })

    it('component init should succeed for found cap element with adjustment', done => { 
        // console.log(component.data); 
        component.data.cap = "found 0.4";    
        component.init();
        done();
    })

    it('component init should succeed for open data', done => { 
        // console.log(component.data); 
        component.data.open = "N 0";    
        component.init();
        done();
    })

    it('component update should succeed', done => { 
        // console.log(component.data);     
        component.update();
        done();
    })

    it('component update should succeed if enabled = false', done => { 
        // console.log(component.data);
        component.data.enabled = false;     
        component.update();
        done();
    })
});
