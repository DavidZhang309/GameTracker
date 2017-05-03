module.exports = function(grunt) {
    grunt.initConfig({
        copy: {
            main: { // copies json files
                expand: true,
                cwd: 'app',
                src: '**/*.json',
                dest: 'build/'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['copy']);
}
  