import path from "path";
import {
  exportData,
  MigrateOptions,
  MigrateCLIOptions,
  printExtractSummary,
  Notebook,
  Rule,
} from "./utils";
import _ from "lodash";
import fs from "fs";
import { extractStores } from "./rule/extractStores";
import { extractStoreLevels } from "./rule/extractStoreLevels";
import { warnS3 } from "./rule/warnS3";
import { cubeVisualize } from "./rule/cubeVisualize";
import { uiWidget } from "./rule/uiWidget";
import { addValueMeasure } from "./rule/addValueMeasure";
import { atotiTypes } from "./rule/atotiTypes";
import { atotiMath } from "./rule/atotiMath";
import { atotiFunctionSwitch } from "./rule/atotiFunctionSwitch";

const migrateNotebook = (
  original: Notebook,
  rules: Rule[],
  options: { hierarchies: string[]; debug: Function }
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

  options.debug(memory);

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
            debug: options.debug,
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

  options.debug(JSON.stringify(memory, null, 2));
  return copy;
};

export const migrate = ({
  notebooks,
  hierarchies,
  debug = () => {},
}: MigrateOptions) => {
  const results = notebooks.map((notebook) => {
    const content = JSON.stringify(
      migrateNotebook(
        notebook.content,
        [
          extractStores,
          extractStoreLevels,
          warnS3,
          cubeVisualize,
          atotiTypes,
          atotiMath,
          atotiFunctionSwitch,
          uiWidget,
          addValueMeasure,
        ],
        { hierarchies, debug }
      ),
      null,
      2
    );

    const oldParsedPath = path.parse(notebook.path);
    const newPath = path.join(
      oldParsedPath.dir,
      oldParsedPath.name + "-v0.5" + oldParsedPath.ext
    );

    return {
      content,
      filePath: newPath,
    };
  });

  return results;
};

export const migrateCLI = ({ notebooks, hierarchies }: MigrateCLIOptions) => {
  const notebooksInfo = notebooks.map((notebook) => ({
    path: notebook,
    content: JSON.parse(fs.readFileSync(notebook, { encoding: "utf-8" })),
  }));

  migrate({
    notebooks: notebooksInfo,
    hierarchies,
    debug: console.log.bind(console),
  }).forEach((result) => {
    exportData(result);
  });

  printExtractSummary({ notebooks });
};
