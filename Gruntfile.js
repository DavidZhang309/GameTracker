module.exports = function(grunt) {
    grunt.initConfig({
        copy: {
            main: { // copies json files
                expand: true,
                cwd: 'app',
                src: '**/*.json',
                dest: 'build/'
            }
        },
        sass: {
            dist: {
                files: {
                    'build/client/site.css': 'app/client/sass/site.scss'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.registerTask('default', ['copy', 'sass']);
}
