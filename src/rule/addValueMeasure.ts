import { MultilineString, CellMetadata, Rule } from "../utils";

// ASSUMPTION = measures are stored in m variable
// ASSUMPTION = any m["XXX.VALUE"] was an automatically created measure from 0.4.3
export const addValueMeasure: Rule = ({
  source,
  metadata,
  memory,
}): [MultilineString, CellMetadata] => {
  if (memory.measuresCreated === undefined) {
    memory.measuresCreated = {};
  }

  const measuresToCreate: string[] = [];
  const doAddValueMeasure = (line: string) => {
    const valueRegex = /m\["([^\]]+)\.VALUE"\]/g;
    let valueResults = valueRegex.exec(line);
    while (valueResults) {
      const numericField = valueResults[1];

      if (memory.level2Hierarchy[numericField] === undefined) {
        throw new Error(
          `Could not find dimension for hierarchy ${numericField}. Add it in the script arguments`
        );
      }

      if (memory.measuresCreated[numericField] === undefined) {
        memory.measuresCreated[numericField] = true;

        measuresToCreate.push(
          `m["${numericField}.VALUE"] = ${
            memory.storeName2Var[memory.level2Hierarchy[numericField]]
          }["${numericField}"]\n`
        );
      }

      valueResults = valueRegex.exec(line);
    }
  };
  if (typeof source === "string") {
    doAddValueMeasure(source);
  } else {
    source.forEach((sourceLine) => doAddValueMeasure(sourceLine));
  }

  return [measuresToCreate.concat(source), metadata];
};
