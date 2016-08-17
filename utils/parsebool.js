'use strict';

function parseBool(value) {
  if (value) {
    value = value.toLowerCase();

    switch (value) {
    case 'on':
    case 'true':
    case 'yes':
      return true;

    case 'false':
    case 'off':
    case 'no':
      return false;
    }

    return;
  } else {
    return value;
  }
}

module.exports = parseBool;
