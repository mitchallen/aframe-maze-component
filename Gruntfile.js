var semver = require("semver");

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({

        // used by the changelog task
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                node: true
            },
            all: ['*.js','./modules/*.js']
        },

        shell: {
            publish: {
                command: 'npm publish'
            },

            pubinit: {
                command: 'npm publish --access public'
            }
        },

        // To test: grunt bump --dry-run

        bump: {
            options: {

                commit: true,
                createTag: true,
                push: true,
                pushTo: 'origin',

                updateConfigs: ['pkg'],
                commitFiles: ['package.json']
            }
        },

        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        // standalone: 'MitchAllen.aframeMazeComponent'
                    },
                    transform: [['babelify', {presets: ['es2015']}]],
                    plugin: [[ "browserify-derequire" ]]
                },
                files: {
                   // if the source file has an extension of es6 then
                   // we change the name of the source file accordingly.
                   // The result file's extension is always .js
                   "./dist/aframe-maze-component.js": ["./browser.js"]
                }
            }
        },

        uglify: {
            my_target: {
                files: {
                    './dist/aframe-maze-component.min.js': ['./dist/aframe-maze-component.js']
                }
            }
        },

        watch: {
             scripts: {
                files: ["./modules/*.js","./*.js"],
                tasks: ['build']
             }
        },

        versionfile: {
            default: {
                src: ['package.json'],
                target: ['product-info.json']
            }
        }

    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask('versionfile', 'A task to write info to a file', function( release ) {
        var srcFile = "package.json",
            targetFile = "product-info.json";
            task = grunt.config('versionfile')[release] || grunt.config('versionfile')['default'];
        if(task) {
            srcFile = task.src[0] || srcFile;
            targetFile = task.target[0] || targetFile;
        }
        // grunt.log.writeln( "TASKS:", task );
        var pkg = grunt.file.readJSON( srcFile );
        var srcName = pkg.name;
        var srcVersion = pkg.version;
        grunt.log.writeln("PACKAGE: " + srcName + ": " + srcVersion );
        if (arguments.length === 0) {
            grunt.log.writeln( srcVersion );
        } else {
            grunt.log.writeln( release + ": " + srcVersion + ' --> ' + semver.inc( srcVersion, release ) );
        }
        var content = JSON.stringify({ 
            name: pkg.name, 
            release: release || "current",
            version: semver.inc( pkg.version, release ) || pkg.version
        });
        grunt.log.writeln( "writing: " + targetFile + ":\n" + content );
        grunt.file.write( targetFile, content );
    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask("build", ['versionfile:patch','jshint','browserify','uglify']);
    grunt.registerTask('pubinit', ['build','shell:pubinit']);
    grunt.registerTask('publish',  ['build','bump','shell:publish']);
};