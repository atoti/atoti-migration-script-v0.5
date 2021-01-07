import { MultilineString, CellMetadata, Rule } from "../utils";

// ASSUMPTION = atoti session variable is "session"
// ASSUMPTION = store variable is not redefined
export const extractStores: Rule = ({
  source,
  metadata,
  memory,
  debug,
}): [MultilineString, CellMetadata] => {
  if (memory.storeVar2Name === undefined) {
    memory.storeVar2Name = {};
  }

  if (memory.storeName2Var === undefined) {
    memory.storeName2Var = {};
  }

  let storeVariable: string, storeName: string;
  const doExtractStores = (line: string) => {
    const storeNameRegex = /store_name="(.+)"/g;
    const storeNameResult = storeNameRegex.exec(line);
    if (storeNameResult) {
      if (storeName) {
        throw new Error(
          "Several store defined in one cell. Please separate them."
        );
      }
      storeName = storeNameResult[1];
    }

    const storeVariableRegex = /(.+) = session\.read_/g;
    const storeVariableResult = storeVariableRegex.exec(line);
    if (storeVariableResult) {
      if (storeVariable) {
        throw new Error(
          "Several store defined in one cell. Please separate them."
        );
      }
      storeVariable = storeVariableResult[1];
    }
  };
  if (typeof source === "string") {
    doExtractStores(source);
  } else {
    source.forEach((sourceLine) => doExtractStores(sourceLine));
  }

  if (storeName && storeVariable) {
    debug(`Found store ${storeName} stored in ${storeVariable}!`);
  }

  memory.storeVar2Name[storeVariable] = storeName;
  memory.storeName2Var[storeName] = storeVariable;

  return [source, metadata];
};
