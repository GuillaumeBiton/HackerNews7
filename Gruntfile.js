'use strict';
/*global require:true, module:false*/
module.exports = function (grunt) {
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        // Task configuration.
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: ''
                }
            }
        },
        watch: {
            app: {
                files: ['index.html'],
                tasks: [''],
                options: {
                    livereload: true
                }
            },
        },
        open: {
            app: {
                path: 'http://localhost:3000/'
            }
        }
    });

    // Default task.
    this.registerTask('default', ['connect', 'open']);

    // Server
    this.registerTask('server', 'Run server', [
        'connect',
        'open',
        'watch'
    ]);
};
