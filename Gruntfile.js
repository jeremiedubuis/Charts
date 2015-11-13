
module.exports = function(grunt){

    grunt.initConfig({

        compass: {
            dist: {
                options: {
                    sassDir: 'scss/',
                    cssDir: 'css/'
                }
            }
        },

        sprite: {

            all: {
                src: 'img/sprites/*.png',
                dest: 'img/spritesheet.png',
                destCss: 'scss/_sprites.scss'
            }

        },

        concat: {
            dist: {
                src: [
                    'js/intro.js',
                    'js/helpers/*.js',
                    'js/components/*.js',
                    'js/modules/*.js',
                    'js/Graph.js',
                    'js/Timeline.js',
                    'js/outro.js'
                ],
                dest: 'js/Charts.build.js',
            },
        },

        uglify: {
            js: {
                expand: true,
                files: {
                'js/Charts.min.js': 'js/Charts.build.js'
                }
            }
        },

        watch: {

            css: {
                files: ['scss/**/*'],
                tasks: ['compass'],
                options: {
                    spawn: false
                }
            },

            js: {
                files: ['js/**/*.js', '!js/Charts.min.js', '!js/Charts.build.js'],
                tasks: ['concat','uglify'],
                options: {
                    spawn: false
                }
            }
        },

    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-spritesmith');

    grunt.registerTask('default', ['compass','concat']);
    grunt.registerTask('dev', ['default','watch']);


}
