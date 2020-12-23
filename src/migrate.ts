import path from "path";
import {
  exportData,
  MigrateOptions,
  printExtractSummary,
} from "./utils";
import _ from "lodash";
import fs from "fs";

export const migrate = async ({
  notebooks,
}: MigrateOptions) => {

  const notebooksContent = notebooks.map(notebook => JSON.parse(fs.readFileSync(notebook, { encoding: "utf-8" })))

  notebooks.forEach((notebook, i )=> {
    const content = JSON.stringify(notebooksContent[i], null, 2); 

    const oldParsedPath = path.parse(notebook);
    const newPath = path.join(oldParsedPath.dir, oldParsedPath.name + "-v0.5" + oldParsedPath.ext);

    exportData({
      content,
      filePath: newPath,
    });
  })

  printExtractSummary({ notebooks });
};
