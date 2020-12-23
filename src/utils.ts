import _ from "lodash";
import fs from "fs";
import path from "path";

export type MigrateOptions = {
  notebooks: string[];
};

type ExportOptions = {
  content: string;
  filePath: string;
};

export const exportData = ({ content, filePath }: ExportOptions) => {
  const parsedPath = path.parse(filePath);

  if (parsedPath.dir) {
    fs.mkdir(parsedPath.dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }

  fs.writeFileSync(filePath, content);
};

export const printExtractSummary = ({
  notebooks,
}: {
  notebooks: string[];
}) => {
  console.log(`${notebooks.length} notebook(s) successfully migrated!`);
};
