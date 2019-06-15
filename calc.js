const fs = require('fs')

const address = process.argv[2];

// Por defecto la acción es read
const action = "read";

const setup = require('./config.json');

// TODO: chequear setup y datos erróneos (por ejemplo, límites mas grandes que 1MB)

const translate = require('./translator.js');

try {
  const result = translate(action, null, address, setup).address;

  console.log("Direccón resultado" , result);
} catch (e) {
  console.log("ERROR");
  console.log(e.message);
}

module.exports = translate;
