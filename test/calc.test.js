const assert = require('assert');
const expect = require('chai').expect;
const _ = require('lodash');
const translate = require('../translator.js');

const setup = {
    "cs": 0,
    "ds": 0,
    "ss": 0,
    "pagination": true,
    "cr3": "000000",
    "gdt": [
        null,
        {
            "base": 30,
            "limit": "900000",
            "g": 0,
            "db": 1,
            "l": 0,
            "avl": 0,
            "p": 1
        }
    ],
    "pageDirectories": {
        "000000": {
            "0": {
                "pageTableBaseDir": "001000",
                "p": 1,
                "rw": 1,
                "us": 1
            },
            "1": {
                "pageTableBaseDir": "002000",
                "p": 1,
                "rw": 1,
                "us": 1
            },
            "2": {
                "pageTableBaseDir": "003000",
                "p": 1,
                "rw": 1,
                "us": 1
            }
        }
    },
    "pageTables": {
        "001000": {
            "0": {
                "baseAddress": "500000",
                "g": 0,
                "p": 1,
                "rw": 1,
                "us": 1
            }
        },
        "002000": {
            "0": {
                "baseAddress": "600000",
                "g": 0,
                "p": 1,
                "rw": 1,
                "us": 1
            }
        },
        "003000": {
            "0": {
                "baseAddress": "700000",
                "g": 0,
                "p": 1,
                "rw": 1,
                "us": 1
            }
        }
    }
};

describe('Translator Tests', function () {
  it('Debería traducir bien una dirección sin paginación', () => {
    const setupSinPaginacion = _.cloneDeep(setup);
    setupSinPaginacion.pagination = false;
    expect(translate("read", 1, "8:0", setupSinPaginacion).address).to.equal("30");
  });
  
  it('Debería traducir bien una dirección con paginación', () => {
    expect(translate("read", 1, "8:0", setup).address).to.equal("500030");
  });
});
