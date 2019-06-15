const DEBUG = false;

function log(message) {
  if (DEBUG == true) {
    console.log(message);
  }
}

function translate(action, quantity, address, setup) {
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

  const realLimit = parseInt(gdtObj.limit, 16);

  if (gdtObj.g) {
    realLimit = realLimit * 4096 + 4095;
  }
  
  if (parseInt(addr, 16) > realLimit) {
    throw new Error(`Offset mayor al límite del segmento: ${addr} > ${gdtObj.limit}`);
  }

  const linealAddress = parseInt(addr, 16) + parseInt(gdtObj.base, 16);

  if (!setup.pagination) {
    return {
      address: linealAddress.toString(16)
    }
  } else {
    const cr3 = setup.cr3;
    // TODO: chequear cosas en el cr3?
    if (!setup.pageDirectories[cr3]) {
      throw new Error(`No hay un page directory en la dirección ${cr3}`);
    }

    const pageDirectory = setup.pageDirectories[cr3];

    const pdIndex = linealAddress>>>22;

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

    const ptIndex = (linealAddress<<10)>>>22;

    log(`ptIndex = ${ptIndex}`);

    if (!pageTable[ptIndex]) {
      throw new Error(`No está definida una entrada de Page Table para el índice ${ptIndex}`);
    }

    const pageTableEntry = pageTable[ptIndex];

    if (!pageTableEntry.p) {
      throw new Error("Page Table Entry no está presente");
    }

    const basePhysicalAddress = parseInt(pageTableEntry.baseAddress, 16);

    const physicalAddress = basePhysicalAddress + (linealAddress % 4096);

    return {
      address: physicalAddress.toString(16)
    };
  }
}

module.exports = translate;
