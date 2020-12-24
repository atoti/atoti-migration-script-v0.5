import path from "path";
import {
  exportData,
  MigrateOptions,
  printExtractSummary,
  Notebook,
  MultilineString,
  CellMetadata,
  Output,
  ExecuteResult,
  OutputType,
} from "./utils";
import _ from "lodash";
import fs from "fs";
import { migrateChart } from "./ui/migrateChart";
import { migrateTable } from "./ui/migrateTable";
import { option } from "yargs";

type rule = (options: {
  source: MultilineString;
  metadata: CellMetadata;
  outputs: Output[];
  memory: any;
}) => [MultilineString, CellMetadata];

// ASSUMPTION = atoti session variable is "session"
// ASSUMPTION = store variable is not redefined
const extractStores: rule = ({
  source,
  metadata,
  memory,
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
    console.log(`Found store ${storeName} stored in ${storeVariable}!`);
  }

  memory.storeVar2Name[storeVariable] = storeName;
  memory.storeName2Var[storeName] = storeVariable;

  return [source, metadata];
};

// ASSUMPTION = store  ".head()" method is used and all columns are displayed in the output (not too many columns)
const extractStoreLevels: rule = ({
  source,
  metadata,
  outputs,
  memory,
}): [MultilineString, CellMetadata] => {
  if (memory.level2Hierarchy === undefined) {
    memory.level2Hierarchy = {};
  }

  const doExtractStoreLevels = (line: string) => {
    _.forEach(memory.storeVar2Name, (storeName, storeVariable) => {
      const headRegex = new RegExp(_.escapeRegExp(`${storeVariable}.head()`));

      if (headRegex.test(line)) {
        console.log(`${storeName} HEAD FOUND!`);

        const execResults = outputs.filter(
          (output) => output.output_type === OutputType.ExecuteResult
        ) as ExecuteResult[];

        execResults.forEach((execResult) => {
          const html = execResult.data["text/html"] as string[];

          if (html) {
            const headStart = html.findIndex((v) => v.includes("<thead>"));
            const headEnd = html.findIndex((v) => v.includes("</thead>"));

            const relevantHtml = html.slice(headStart, headEnd);

            const levels = relevantHtml
              .map((th) => {
                const thRegex = /<th>(.+)<\/th>/g;
                const result = thRegex.exec(th);
                return result && result[1];
              })
              .filter((level) => level !== null);
            levels.forEach((lvl) => {
              memory.level2Hierarchy[lvl] = storeName;
            });
          }
        });
      }
    });
  };
  if (typeof source === "string") {
    doExtractStoreLevels(source);
  } else {
    source.forEach((sourceLine) => doExtractStoreLevels(sourceLine));
  }

  return [source, metadata];
};

const warnS3: rule = ({
  source,
  metadata,
}): [MultilineString, CellMetadata] => {
  const doWarnS3 = (line: string) => {
    if (line.includes("s3://")) {
      console.log(`Please install the plugin atoti-aws`);
    }
  };
  if (typeof source === "string") {
    doWarnS3(source);
  } else {
    source.forEach((sourceLine) => doWarnS3(sourceLine));
  }

  return [source, metadata];
};

// ASSUMPTION = atoti cube name is "cube"
// ASSUMPTION = atoti session variable is "session"
const cubeVisualize: rule = ({
  source,
  metadata,
}): [MultilineString, CellMetadata] => {
  const doCubeVisualize = (line: string): string => {
    if (line.includes("cube.visualize")) {
      console.log(`Migrating "cube.visualize" to "session.visualize"...`);
      return line.replace("cube.visualize", "session.visualize");
    } else {
      return line;
    }
  };
  if (typeof source === "string") {
    return [doCubeVisualize(source), metadata];
  } else {
    return [source.map((sourceLine) => doCubeVisualize(sourceLine)), metadata];
  }
};

const uiWidget: rule = ({
  source,
  metadata,
  memory,
}): [MultilineString, CellMetadata] => {
  if (metadata.atoti && metadata.atoti.state) {
    let widget = metadata.atoti.state;

    if (widget.value && widget.value.containerKey === "chart") {
      console.log(`Migrating chart state...`);
      widget = migrateChart(widget);
    } else if (widget.value && widget.value.containerKey === "pivot-table") {
      console.log(`Migrating pivot table state...`);
      widget = migrateTable(widget);
    } else {
      console.log(`Migrating widget metadata to new format...`);
    }

    // Migrating MDX
    widget = _.cloneDeepWith(widget, (value) => {
      if (typeof value === "string") {
        const hierarchyRegex = /\[Hierarchies\]\.\[([^\.]+)\]/g;
        return value.replace(
          hierarchyRegex,
          (match, p1, offset, input_string) => {
            if (memory.level2Hierarchy[p1]) {
              return `[${memory.level2Hierarchy[p1]}].[${p1}]`;
            } else {
              throw new Error(
                `Could not find dimension for hierarchy ${p1}. Add it in the script arguments`
              );
            }
          }
        );
      }
    });

    return [source, Object.assign({}, metadata, { atoti: { widget } })];
  } else {
    return [source, metadata];
  }
};

// ASSUMPTION = measures are stored in m variable
// ASSUMPTION = any m["XXX.VALUE"] was an automatically created measure from 0.4.3
const addValueMeasure: rule = ({
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

const migrateNotebook = (
  original: Notebook,
  rules: rule[],
  options: { hierarchies: string[] }
) => {
  const copy = _.cloneDeep(original);
  const memory = {
    level2Hierarchy: {} as { [key: string]: string },
  };

  if (options.hierarchies) {
    options.hierarchies.forEach((hierOption) => {
      const [dim, hier] = hierOption.split(":");
      memory.level2Hierarchy[hier] = dim;
    });
  }

  console.log(memory);

  copy.cells = original.cells.map((cell) => {
    switch (cell.cell_type) {
      case "code":
        let source = _.cloneDeep(cell.source);
        let metadata = _.cloneDeep(cell.metadata);
        let outputs = _.cloneDeep(cell.outputs);

        rules.forEach((rule) => {
          [source, metadata] = rule({
            source,
            metadata,
            outputs,
            memory,
          });
        });

        return Object.assign({}, cell, {
          source,
          metadata,
          outputs,
        });
      default:
        // nothing to do
        break;
    }

    return cell;
  });

  console.log(JSON.stringify(memory, null, 2));
  return copy;
};

export const migrate = async ({ notebooks, hierarchies }: MigrateOptions) => {
  const notebooksContent = notebooks.map((notebook) =>
    JSON.parse(fs.readFileSync(notebook, { encoding: "utf-8" }))
  );

  notebooks.forEach((notebook, i) => {
    const content = JSON.stringify(
      migrateNotebook(
        notebooksContent[i],
        [
          extractStores,
          extractStoreLevels,
          warnS3,
          cubeVisualize,
          uiWidget,
          addValueMeasure,
        ],
        { hierarchies }
      ),
      null,
      2
    );

    const oldParsedPath = path.parse(notebook);
    const newPath = path.join(
      oldParsedPath.dir,
      oldParsedPath.name + "-v0.5" + oldParsedPath.ext
    );

    exportData({
      content,
      filePath: newPath,
    });
  });

  printExtractSummary({ notebooks });
};
