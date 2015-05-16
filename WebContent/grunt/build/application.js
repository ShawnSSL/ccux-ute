/*globals module, require*/

(function () {
    'use strict';

    module.exports = function (grunt) {
        var oGruntConfig;

        oGruntConfig = {};

        //Perform javascript linting on all application javascript files
        oGruntConfig.jshint = (function (grunt) {
            var oConfig;

            oConfig = {
                app: {
                    files: {
                        cwd: 'src',
                        src: [
                            'nrg/**/*.js'
                        ]
                    }
                }
            };

            return oConfig;
        }(grunt));

        //Clean application folder in build
        oGruntConfig.clean = (function (grunt) {
            var oConfig;

            oConfig = {
                app: [
                    'build/nrg/**'
                ]
            };

            return oConfig;
        }(grunt));

        //Copy relevant application files to build.
        //Javascript files will be copied with suffix -dbg
        oGruntConfig.copy = (function (grunt) {
            var oConfig;

            oConfig = {
                control: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                'nrg/asset/css/core/font/**',
                                'nrg/asset/img/**/*.png'
                            ],
                            dest: 'build/',
                            filter: 'isFile'
                        },
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                'nrg/**/*.js'
                            ],
                            dest: 'build/',
                            filter: 'isFile',
                            rename: function (dest, src) {
                                var aSrc = src.split('.');
                                aSrc[0] = aSrc[0] + '-dbg';
                                dest = dest + aSrc.join('.');
                                return dest;
                            }
                        }
                    ]
                }
            };

            return oConfig;
        }(grunt));

        //Merge all module properties files into relevant locale files.
        oGruntConfig.concat = (function (grunt) {
            var oConfig;

            oConfig =  {
                noLang: {
                    src: [
                        'src/nrg/i18n/view/**/*_en_US.properties'
                    ],
                    dest: 'build/nrg/i18n/messageBundle.properties'
                },
                enUs: {
                    src: [
                        'src/nrg/i18n/view/**/*_en_US.properties'
                    ],
                    dest: 'build/nrg/i18n/messageBundle_en_US.properties'
                }
            };

            return oConfig;
        }(grunt));

        //Compile LESS files to compressed CSS files with IE10 and above compatibility
        oGruntConfig.less = (function (grunt) {
            var oConfig, LessPluginAutoPrefix, LessPluginCleanCss, oLessAutoPrefix, oLessCleanCss;

            LessPluginAutoPrefix = require('less-plugin-autoprefix');
            LessPluginCleanCss = require('less-plugin-clean-css');

            oLessAutoPrefix = new LessPluginAutoPrefix({
                browsers: [
                    'ie >= 10'
                ]
            });

            oLessCleanCss = new LessPluginCleanCss({
                advanced: true
            });

            oConfig = {
                app: {
                    options: {
                        plugins: [
                            oLessAutoPrefix,
                            oLessCleanCss
                        ]
                    },
                    files: {
                        'build/nrg/asset/css/nrg.css': 'src/nrg/asset/css/nrg.source.less'
                    }
                }
            };

            return oConfig;
        }(grunt));

        //Mangle and compress control javascript files
        oGruntConfig.uglify = (function (grunt) {
            var oConfig;

            oConfig = {
                app: {
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                'nrg/**/*.js'
                            ],
                            dest: 'build'
                        }
                    ]
                }
            };

            return oConfig;
        }(grunt));

        //Merge related json files
        //Sequence is important for routes!
        //Make sure manifest.json is last in src because catchall route needs to be last
        oGruntConfig['merge-json'] = (function (grunt) {
            var oConfig;

            oConfig =  {
                'manifest-ic': {
                    src: [
                        'src/nrg/view/**/routing.json',
                        'src/nrg/component/ic/manifest.json'
                    ],
                    dest: 'build/nrg/component/ic/manifest.json'
                },
                'manifest-retention': {
                    src: [
                        'src/nrg/view/**/routing.json',
                        'src/nrg/component/retention/manifest.json'
                    ],
                    dest: 'build/nrg/component/retention/manifest.json'
                }
            };

            return oConfig;
        }(grunt));

        //Compress related json files - right now, it is only for manifest
        oGruntConfig['json-minify'] = (function (grunt) {
            var oConfig;

            oConfig = {
                app: {
                    files: 'build/nrg/component/**/manifest.json'
                }
            };

            return oConfig;
        }(grunt));

        //Compress related HTML and XML files
        oGruntConfig.htmlmin = (function (grunt) {
            var oConfig;

            oConfig =  {
                html: {
                    options: {
                        removeComments: true,
                        collapseWhitespace: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                'nrg/**/*.html'
                            ],
                            dest: 'build'
                        }
                    ]
                },
                xml: {
                    options: {
                        removeComments: true,
                        collapseWhitespace: true,
                        preventAttributesEscaping: true,
                        caseSensitive: true,
                        keepClosingSlash: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: 'src',
                            src: [
                                'nrg/view/**/*.xml'
                            ],
                            dest: 'build'
                        }
                    ]
                }
            };

            return oConfig;
        }(grunt));

        //Create preload for control library and components
        oGruntConfig.openui5_preload = (function (grunt) {
            var oConfig;

            oConfig = {
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
                                'nrg/view/app/App*.xml',
                                'nrg/view/others/*Empty.view.xml',
                                'nrg/view/app/App*.js',
                                'nrg/view/others/*Empty.controller.js'
                            ]
                        },
                        'nrg/component/retention': {
                            src: [
                                'nrg/view/app/App*.xml',
                                'nrg/view/others/*Empty.view.xml',
                                'nrg/view/app/App*.js',
                                'nrg/view/others/*Empty.controller.js'
                            ]
                        }
                    }
                }
            };

            return oConfig;
        }(grunt));



        grunt.initConfig(oGruntConfig);

        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-less');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-merge-json');
        grunt.loadNpmTasks('grunt-json-minify');
        grunt.loadNpmTasks('grunt-contrib-htmlmin');
        grunt.loadNpmTasks('grunt-openui5');


        grunt.registerTask('default', [
            'jshint',
            'clean',
            'copy',
            'concat',
            'less',
            'uglify',
            'merge-json',
            'json-minify',
            'htmlmin',
            'openui5_preload'
        ]);
    };

}());
