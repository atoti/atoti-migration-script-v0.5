import path from "path";
import {
  exportData,
  MigrateOptions,
  printExtractSummary,
  Notebook,
  MultilineString,
  CellMetadata,
} from "./utils";
import _ from "lodash";
import fs from "fs";
import { migrateChart } from "./ui/migrateChart";

type rule = (
  source: MultilineString,
  metadata: CellMetadata,
  memory: {}
) => [MultilineString, CellMetadata];

const warnS3 = (
  source: MultilineString,
  metadata: CellMetadata
): [MultilineString, CellMetadata] => {
  const doWarnS3 = (line: string) => {
    if (line.includes("s3://")) {
      console.log(`Please install the plugin atoti-aws with pip or conda:
        - pip install atoti[aws]
        - conda install atoti-aws`);
    }
  };
  if (typeof source === "string") {
    doWarnS3(source);
  } else {
    source.forEach((sourceLine) => doWarnS3(sourceLine));
  }

  return [source, metadata];
};

const cubeVisualize = (
  source: MultilineString,
  metadata: CellMetadata
): [MultilineString, CellMetadata] => {
  const doCubeVisualize = (line: string): string => {
    if (line.includes("cube.visualize")) {
      console.log(`Migrating "cube.visualize" to "session.visualize"`);
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

const uiWidget = (
  source: MultilineString,
  metadata: CellMetadata
): [MultilineString, CellMetadata] => {
  if (metadata.atoti && metadata.atoti.state) {
    console.log(`Migrating widget metadata to new format`);
    let widget = metadata.atoti.state;

    if (widget.value && widget.value.containerKey === "chart") {
      console.log(`Migrating chart state`);
      widget = migrateChart(widget);

      console.log(`Migrating chart's MDX`);
      widget = _.cloneDeepWith(widget, (value) => {
        if (typeof value === "string") {
          return value.replace("[Hierarchies].", "[classified_products].");
        }
      });
    }

    return [source, Object.assign({}, metadata, { atoti: { widget } })];
  } else {
    return [source, metadata];
  }
};

const migrateNotebook = (original: Notebook, rules: rule[]) => {
  const copy = _.cloneDeep(original);
  const memory = {};

  copy.cells = original.cells.map((cell) => {
    switch (cell.cell_type) {
      case "code":
        let sourceCopy = _.cloneDeep(cell.source);
        let metadataCopy = _.cloneDeep(cell.metadata);

        rules.forEach((rule) => {
          [sourceCopy, metadataCopy] = rule(sourceCopy, metadataCopy, memory);
        });

        return Object.assign({}, cell, {
          source: sourceCopy,
          metadata: metadataCopy,
        });
      default:
        // nothing to do
        break;
    }

    return cell;
  });

  return copy;
};

export const migrate = async ({ notebooks }: MigrateOptions) => {
  const notebooksContent = notebooks.map((notebook) =>
    JSON.parse(fs.readFileSync(notebook, { encoding: "utf-8" }))
  );

  notebooks.forEach((notebook, i) => {
    const content = JSON.stringify(
      migrateNotebook(notebooksContent[i], [warnS3, cubeVisualize, uiWidget]),
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
