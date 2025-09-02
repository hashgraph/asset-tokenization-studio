import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
// Para Ethers v5, EventFragment nos ayuda con el tipado si lo necesitamos.
// Puedes importarlo de 'ethers/lib/utils' o '@ethersproject/abi' dependiendo de tu setup.
// Si hre.ethers ya es v5, no necesitas esta importación explícita para EventFragment
// a menos que quieras un tipado más estricto.
import { FunctionFragment } from '@ethersproject/abi'; // O 'ethers/lib/utils'
import { id } from 'ethers/lib/utils';

task(
  'list-events-v5',
  'Muestra los nombres y selectores (topic hash) de los eventos para Ethers v5',
).setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  console.log('Obteniendo firmas de eventos (Ethers v5)...');

  // Asegurarse de que ethers en HRE es v5.
  // Esto es una comprobación rudimentaria; la versión exacta puede variar (e.g., 5.7.2).

  const allContractEvents: {
    [contractName: string]: { name: string; selector: string }[];
  } = {};

  const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
  console.log('contractNames');
  console.log(contractNames);
  for (const qualifiedName of contractNames) {
    try {
      const artifact = await hre.artifacts.readArtifact(qualifiedName);
      const contractName = artifact.contractName;

      if (!artifact.abi || artifact.abi.length === 0) {
        // console.log(`Skipping ${contractName} (no ABI or empty ABI)`);
        continue;
      }

      // En Ethers v5, creamos la instancia de Interface así:
      const contractInterface = new hre.ethers.utils.Interface(artifact.abi);

      const eventsData = [];

      for (const fragment of contractInterface.fragments) {
        if (fragment.type === 'function') {
          // Casteamos a FunctionFragment para tener mejor autocompletado y seguridad de tipos
          const functionFragment = fragment as FunctionFragment;
          const functionName = functionFragment.name;

          // En Ethers v5, usamos getSighash para obtener el selector de la función
          const functionSelector =
            contractInterface.getSighash(functionFragment);

          eventsData.push({
            name: functionName,
            selector: functionSelector,
          });
        }
      }

      if (eventsData.length > 0) {
        // Podrías querer almacenar por qualifiedName si tienes colisiones de contractName
        allContractEvents[contractName] = eventsData;
      }
    } catch (error) {
      console.warn(
        `No se pudo procesar ${qualifiedName}: ${(error as Error).message}`,
      );
    }
  }

  if (Object.keys(allContractEvents).length === 0) {
    console.log('No se encontraron eventos en ningún contrato.');
  } else {
    // Imprimir el JSON
    console.log(JSON.stringify(allContractEvents, null, 2));

    // Si prefieres un objeto plano { 'EventName(params)': 'selector', ... }
    // (esto puede tener colisiones si diferentes contratos tienen el mismo evento)
    /*
      const flatEventMap: { [signature: string]: string } = {};
      for (const contractName in allContractEvents) {
        allContractEvents[contractName].forEach(event => {
          // Para obtener una firma más completa como la de 'sighash' en ethers v6
          // necesitamos reconstruirla un poco o usar el fragmento completo.
          // Por ahora, solo nombre y selector simple.
          // const fullSignature = `${event.name}(${(contractInterface.getEvent(event.name).inputs.map(i => i.type)).join(',')})`;
          // flatEventMap[`${contractName}.${event.name}`] = event.selector; // Evitar colisiones
          flatEventMap[event.name] = event.selector; // Simple, puede haber colisiones
        });
      }
      console.log("Eventos como objeto plano (nombre: selector):");
      console.log(JSON.stringify(flatEventMap, null, 2));
      */
  }
});

task(
  'list-functions-v5',
  'Muestra los nombres y selectores (topic hash) de los eventos para Ethers v5',
).setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  console.log('Obteniendo firmas de las funciones (Ethers v5)...');

  // Asegurarse de que ethers en HRE es v5.
  // Esto es una comprobación rudimentaria; la versión exacta puede variar (e.g., 5.7.2).

  const allContractEvents: {
    [contractName: string]: { name: string; selector: string }[];
  } = {};

  const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
  console.log('contractNames');
  console.log(contractNames);
  for (const qualifiedName of contractNames) {
    try {
      const artifact = await hre.artifacts.readArtifact(qualifiedName);
      const contractName = artifact.contractName;

      if (!artifact.abi || artifact.abi.length === 0) {
        // console.log(`Skipping ${contractName} (no ABI or empty ABI)`);
        continue;
      }

      // En Ethers v5, creamos la instancia de Interface así:
      const contractInterface = new hre.ethers.utils.Interface(artifact.abi);

      const eventsData = [];

      for (const fragment of contractInterface.fragments) {
        if (fragment.type === 'function') {
          // Casteamos a EventFragment para tener mejor autocompletado y seguridad de tipos
          const functionFragment = fragment as FunctionFragment;
          const functionName = functionFragment.name;

          // En Ethers v5, usamos getEventTopic para obtener el selector del evento (topic hash)
          const functionSelector = id(
            functionFragment.format('sighash'),
          ).substring(0, 10);

          eventsData.push({
            name: functionName,
            selector: functionSelector,
          });
        }
      }

      if (eventsData.length > 0) {
        // Podrías querer almacenar por qualifiedName si tienes colisiones de contractName
        allContractEvents[contractName] = eventsData;
      }
    } catch (error) {
      console.warn(
        `No se pudo procesar ${qualifiedName}: ${(error as Error).message}`,
      );
    }
  }

  if (Object.keys(allContractEvents).length === 0) {
    console.log('No se encontraron eventos en ningún contrato.');
  } else {
    // Imprimir el JSON
    console.log(JSON.stringify(allContractEvents, null, 2));

    // Si prefieres un objeto plano { 'EventName(params)': 'selector', ... }
    // (esto puede tener colisiones si diferentes contratos tienen el mismo evento)
    /*
      const flatEventMap: { [signature: string]: string } = {};
      for (const contractName in allContractEvents) {
        allContractEvents[contractName].forEach(event => {
          // Para obtener una firma más completa como la de 'sighash' en ethers v6
          // necesitamos reconstruirla un poco o usar el fragmento completo.
          // Por ahora, solo nombre y selector simple.
          // const fullSignature = `${event.name}(${(contractInterface.getEvent(event.name).inputs.map(i => i.type)).join(',')})`;
          // flatEventMap[`${contractName}.${event.name}`] = event.selector; // Evitar colisiones
          flatEventMap[event.name] = event.selector; // Simple, puede haber colisiones
        });
      }
      console.log("Eventos como objeto plano (nombre: selector):");
      console.log(JSON.stringify(flatEventMap, null, 2));
      */
  }
});
