
const Library = require('../');

describe('Library', function () {

  it('should return a `Library` instance', function () {
    // no arguments (or null) means to dlopen the currently running process
    const lib = new Library();
    expect(lib).toEqual(jasmine.any(Library));
  });

});
