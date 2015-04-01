/*globals module, require*/
/*jshint -W024 */

(function () {
    'use strict';

    module.exports = function (grunt) {
        var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
            LessPluginCleanCss = require('less-plugin-clean-css'),
            oLessAutoPrefix = new LessPluginAutoPrefix({
                browsers: [
                    'ie >= 9'
                ]
            }),
            oLessCleanCss = new LessPluginCleanCss({
                advanced: true
            });


        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),

            //JS code quality check with JSHint
            jshint: {
                all: [
                    'src/**/*.js',
                    'Gruntfile.js'
                ]
            },

            //Copy everything to build folder
            //Selected UI5 specifc JS files will be recopied with suffix -dbg for sap-ui-debug purpose
            copy: {
                all: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                '**/*'
                            ],
                            dest: 'build/',
                            filter: 'isFile'
                        },
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                'nrg/component/**/*.js',
                                'nrg/controller/**/*.js',
                                'nrg/util/**/*.js',
                                'nrg/view/**/*.js',
                                'ute/ui/commons/**/*.js'
                            ],
                            dest: 'build/',
                            filter: 'isFile',
                            rename: function (dest, src) {
                                var aSrc = src.split('.');
                                aSrc[aSrc.length - 2] = aSrc[aSrc.length - 2] + '-dbg';
                                dest = dest + aSrc.join('.');
                                return dest;
                            }
                        }
                    ]
                }
            },

            //Compile LESS files to compressed CSS files with IE9 and above compatibility
            less: {
                all: {
                    options: {
                        plugins: [
                            oLessAutoPrefix,
                            oLessCleanCss
                        ]
                    },
                    files: {
                        'build/nrg/asset/css/nrg.css': 'src/nrg/asset/css/nrg.source.less',
                        'build/ute/ui/commons/themes/base/library.css': 'src/ute/ui/commons/themes/base/library.source.less',
                        'build/ute/ui/commons/themes/sap_bluecrystal/library.css': 'src/ute/ui/commons/themes/sap_bluecrystal/library.source.less'
                    }
                }
            },

            csslint: {
                strict: {
                    src: [
                        'build/nrg/asset/css/nrg.css',
                        'build/ute/ui/commons/themes/base/library.css',
                        'build/ute/ui/commons/themes/sap_bluecrystal/library.css'
                    ]
                }
            },

            //Compress javascript files
            uglify: {
                target: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: '**/*.js',
                            dest: 'build'
                        }
                    ]
                }
            },

            //Compress HTML and XML files
            htmlmin: {
                all: {
                    options: {
                        removeComments: true,
                        collapseWhitespace: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: '**/*.html',
                            dest: 'build'
                        },
                        {
                            expand: true,
                            cwd: 'src',
                            src: '**/*.xml',
                            dest: 'build'
                        }
                    ]
                }
            },

            //Create preload for control library and components
            openui5_preload: {
                lib: {
                    options: {
                        resources: 'src',
                        dest: 'build'
                    },
                    libraries: true
                },

                comp: {
                    options: {
                        resources: 'src',
                        dest: 'build'
                    },
                    components: {
                        'nrg/component/ic': {
                            src: [
                                'nrg/view/App*.xml',
                                'nrg/view/*Empty.view.xml',
                                'nrg/controller/App*.js'
                            ]
                        },
                        'nrg/component/retention': {
                            src: [
                                'nrg/view/App*.xml',
                                'nrg/view/*Empty.view.xml',
                                'nrg/controller/App*.js'
                            ]
                        }
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-openui5');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-less');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-htmlmin');
        grunt.loadNpmTasks('grunt-contrib-csslint');
        grunt.registerTask('default', ['jshint', 'copy', 'openui5_preload', 'uglify', 'htmlmin', 'less']);
        grunt.registerTask('no_qc', ['copy', 'openui5_preload', 'uglify', 'htmlmin', 'less']);
    };
}());
