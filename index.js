'use strict';
var through = require('through2');
var gutil = require('gulp-util');
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
      var image = sharp(file.contents);
      var format = !options.format ? metadata.format : options.format

      image
        .metadata()
        .then(function(metadata){
          return image
            .max()
            .withoutEnlargement()
            .quality((!options.quality ? 80 : options.quality))
            .compressionLevel((!options.compressionLevel ? 6 : options.compressionLevel))
        })

      image
        .toFormat(format)
        .toBuffer(function(err, buffer) {
          var newFile = new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: gutil.replaceExtension(file.path, '.' + format),
            contents: image
          });

          callback(null, newFile);
      });
    }
  });

}

module.exports = gulpSharpMinimal;
