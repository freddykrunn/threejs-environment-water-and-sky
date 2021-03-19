const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const header = require('gulp-header');
const plumber = require("gulp-plumber");
const fs = require("fs");


gulp.task('minify', function() {
    const filesArray = [];

    filesArray.push("vendor/Reflector.js");
    filesArray.push("vendor/Refractor.js");
    filesArray.push("src/Water.js");
    filesArray.push("src/Sky.js");
    filesArray.push("src/Sun.js");
    filesArray.push("src/Environment.js");
    filesArray.push("src/EnvironmentPhongMaterial.js");

    return gulp.src(filesArray)
      .pipe(plumber())
      .pipe(concat("THREEx.Environment.js"))
      .pipe(
        babel({
          plugins: [
            "@babel/plugin-transform-classes",
            "@babel/plugin-transform-for-of",
            "@babel/plugin-transform-instanceof",
            "@babel/plugin-transform-object-super",
            "@babel/plugin-transform-template-literals"
          ]
        })
      )
      .pipe(uglify())
      .pipe(header(`
/**
 * Copyright notice
 * 
 * Some third party libraries are bundled with the framework.
 * The credits and copyright notice are listed below:
 * 
 * @credits for THREE.Reflector - Copyright (c) 2021 Three.js authors (MIT License)
 * @credits for THREE.Refractor - Copyright (c) 2021 Three.js authors (MIT License)
 */

var THREEx	= THREEx || {};

`))
      .pipe(gulp.dest("./dist"))
});