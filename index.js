'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var getFileSize = require("filesize");
var sharp = require('sharp');

const PLUGIN_NAME = 'gulp-sharp-minimal';

function gulpSharpMinimal(options){

  return through.obj(function(file, encoding, callback) {


    if (file.isNull()) {
      this.push(file)
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, "Received a stream... Streams are not supported. Sorry."));
      return callback();
    }

    if (file.isBuffer()) {
      // this.emit('error', new gutil.PluginError(PLUGIN_NAME, "Received a buffer..."));
      var image = sharp(file.contents);

      image
        .metadata()
        .then(function(metadata){
          return image
            .max()
            .withoutEnlargement()
            .quality((!options.quality ? 80 : options.quality))
            .compressionLevel((!options.compressionLevel ? 6 : options.compressionLevel))
            .toFormat((!options.format ? metadata.format : options.format))
            .toBuffer()
        })
        .then(function(data){
          if (options.progressive){
            image.progressive()
          }

          if (options.stripMetadata){
            // if true - then we keep all EXIF data of image
            // otherwise default behavior is to strip it all
            image.withMetadata();
          }
          return image;
        })

        .then(function(sequentialRead){
          if (options.sequentialRead){
            image.sequentialRead()
          }
          return image;

         })

        .then(function(trellisQuantisation){
          if (options.trellisQuantisation){
            image.trellisQuantisation()
          }
          return image;
        })

        .then(function(data) {

          var newFile = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: file.path,
            contents: image
          });
          // gutil.log(PLUGIN_NAME + ':', gutil.colors.green(newFile.relative + " : size before: "+file_size_before+" : size after: "+file_size_after));
          callback(null, data);
      });
    }
  });

}

module.exports = gulpSharpMinimal;
