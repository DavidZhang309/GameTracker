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
            }
        },
        ts: {
            app: {
                src: ['app/**/*.ts', '!app/client/**'],
                dest: 'build/'
            },
            site: {
                src: ['app/client/ts/**/*.ts'],
                dest: 'build/client/site.js',
                options: {
                    module: 'amd'
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
