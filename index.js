
/**
 * Module dependencies.
 */

const debug = require('debug')('dlopen');
const bindings = require('bindings')('binding');

class Library extends bindings.Library {
  /**
   * The `Library` class is an object-oriented wrapper around the
   * dlopen(), dlclose(), dlsym() and dlerror() functions.
   *
   * @param {String} name - Library name or full filepath
   * @api public
   */
  constructor(name) {
    if (name) {
      // append the `ext` if necessary
      const ext = exports.ext[process.platform];
      if (name.substring(name.length - ext.length) !== ext) {
        debug('appending dynamic lib suffix (%s)', ext, name);
        name += ext;
      }
    } else {
      // if no name was passed in then pass `null` to open the current process
      name = null;
    }

    debug('library name', name);
    super(name);
    this.name = name;
  }

  /**
   * Calls `uv_dlsym()` on this Library instance.
   *
   * A Node.js `Buffer` instance is returned which points to the
   * memory location of the requested "symbol".
   *
   * @param {String} name - Symbol name to attempt to retrieve
   * @return {Buffer} a Buffer instance pointing to the memory address of the symbol
   * @api public
   */
  get(name) {
    debug('get()', name);
    const sym = super.get(name);
    // add some debugging info
    sym.name = name;
    sym.lib = this;
    return sym;
  }

  /**
   * Calls `uv_dlclose()` on this Library instance.
   *
   * @api public
   */
  close() {
    debug('close()');
    super.close();
  }
};


/**
 * Map of `process.platform` values to their corresponding
 * "dynamic library" file name extension.
 */

Library.ext = {
  linux:   '.so',
  linux2:  '.so',
  sunos:   '.so',
  solaris: '.so',
  freebsd: '.so',
  openbsd: '.so',
  darwin:  '.dylib',
  mac:     '.dylib',
  win32:   '.dll'
};

/**
 * Module exports.
 */
exports = module.exports = Library;
