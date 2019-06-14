const fs = require('fs')

const address = process.argv[2];

// Por defecto la acción es read
const action = "read";

const DEBUG = true;

const setup = require('./config.json');

function log(message) {
  if (DEBUG == true) {
    console.log(message);
  }
}


// TODO: chequear setup y datos erróneos (por ejemplo, límites mas grandes que 1MB)

function translate(action, address, setup) {
  let [selector, addr] = address.split(":");

  // TODO: chequear los permisos RPL?
  const gdtIndex = parseInt(selector, 16)>>>3;

  log(`Selected GDT index: ${gdtIndex}`);

  if (gdtIndex == 0) {
    throw new Error("Segmento nulo");
  }

  if (gdtIndex >= setup.gdt.length) {
    throw new Error(`Índice de segmento erróneo: ${gdtIndex}`);
  }

  const gdtObj = setup.gdt[gdtIndex];

  if (parseInt(addr, 16) > parseInt(gdtObj.limit, 16)) {
    // TODO: calcular límite con G=1
    throw new Error(`Offset mayor al límite del segmento: ${addr} > ${gdtObj.limit}`);
  }

  const linealAddress = parseInt(addr, 16) + parseInt(gdtObj.base, 16);

  if (!setup.pagination) {
    return linealAddress.toString(16);
  } else {
    const cr3 = setup.cr3;
    // TODO: chequear cosas en el cr3?
    if (!setup.pageDirectories[cr3]) {
      throw new Error(`No hay un page directory en la dirección ${cr3}`);
    }

    const pageDirectory = setup.pageDirectories[cr3];

    const pdIndex = parseInt(addr, 16)>>>22;

    log(`pdIndex = ${pdIndex}`);

    if (!pageDirectory[pdIndex]) {
      throw new Error(`No hay Page Directory Entry definida para el index ${pdIndex}`);
    }

    const pdEntry = pageDirectory[pdIndex];

    if (!pdEntry.p) {
      throw new Error("Page Directory entry no está presente");
    }

    if (!setup.pageTables[pdEntry.pageTableBaseDir]) {
      throw new Error(`No existe una Page Table en la dirección ${pdEntry.pageTableBaseDir}`);
    }

    const pageTable = setup.pageTables[pdEntry.pageTableBaseDir];

    const ptIndex = (parseInt(addr, 16)<<10)>>>22;

    log(`ptIndex = ${ptIndex}`);

    if (!pageTable[ptIndex]) {
      throw new Error(`No está definida una entrada de Page Table para el índice ${ptIndex}`);
    }

    const pageTableEntry = pageTable[ptIndex];

    if (!pageTableEntry.p) {
      throw new Error("Page Table Entry no está presente");
    }

    const basePhysicalAddress = parseInt(pageTableEntry.baseAddress, 16);

    const physicalAddress = basePhysicalAddress + (parseInt(addr, 16) % 4096);

    return physicalAddress.toString(16);
  }
}

try {
  const result = translate(action, address, setup);

  console.log("Direccón resultado" , result);
} catch (e) {
  console.log("ERROR");
  console.log(e.message);
}
