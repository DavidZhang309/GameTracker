module.exports = function(grunt) {
    grunt.initConfig({
        copy: {
            json: { // copies json files
                expand: true,
                cwd: 'app',
                src: '**/*.json',
                dest: 'build/'
            }//,
            // templates: {
            //     expand: true,
            //     cwd: 'app',
            //     src: 'templates/**/*.handlebars',
            //     dest: 'build/'
            // }
        },
        sass: {
            dist: {
                files: {
                    'build/client/site.css': 'app/client/sass/site.scss'
                }
            }
        },
        watch: {
            styles: {
                files: ['app/client/sass/**.scss'],
                tasks: ['sass'],
                options: {

                }
            },
            scripts: {
                files: ['app/client/ts/**/*.ts'],
                tasks: ['ts:site']
            }
        },
        ts: {
            app: {
                src: ['app/server/**/*.ts'],//, '!app/client/**'],
                dest: 'build/server',
                options: {
                    lib: [ "es2015" ]
                }
            },
            site: {
                src: ['app/client/ts/**/*.ts'],
                dest: 'build/client/site.js',
                options: {
                    module: 'amd'
                }
            },
            angular: {
                src: ['app/client/angular/**/*.ts'],
                dest: 'build/client/angular',
                options: {
                    target: "es5",
                    module: "umd",
                    moduleResolution: 'node',
                    lib: [ "es2015", "dom" ],
                    sourceMap: true,
                    emitDecoratorMetadata: true,
                    experimentalDecorators: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', ['copy', 'sass', 'ts']);
    grunt.registerTask('dev', ['copy', 'sass', 'ts', 'watch']);
}
