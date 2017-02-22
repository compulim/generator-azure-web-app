'use strict';

function merge(base, override) {
  base = Object.assign({}, base);

  Object.keys(override).forEach(name => {
    const value = override[name];

    if (value === null) {
      delete base[name];
    } else if (
      !Array.isArray(value)
      && typeof value === 'object'
    ) {
      base[name] = merge(base[name], value);
    } else {
      base[name] = value;
    }
  });

  return base;
}

module.exports = {
  merge
};
