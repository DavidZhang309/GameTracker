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
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['copy', 'sass']);
    grunt.registerTask('dev', ['copy', 'sass', 'watch']);
}
