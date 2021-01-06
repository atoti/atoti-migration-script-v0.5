import _ from "lodash";
// import { Query } from "@activeviam/activepivot-client";
// import { DataModel, getCube } from "dataModel";
// import {
//   getCubeName,
//   getLevels,
//   getMeasures,
//   MdxSelect,
//   MdxString,
//   parse,
//   quote,
// } from "@activeviam/mdx";
// import { DataVisualizationWidgetMapping } from "@activeviam/widget";

export const _getMappingFromQuery = (query: any, dataModel?: any): any => {
  //   const mdx = parse<MdxSelect>(query.mdx);
  //   const cubeName = getCubeName(mdx);
  //   const cube = dataModel ? getCube(dataModel, cubeName) : undefined;

  //   const [levelsOnRows, levelsOnColumns] = ["ROWS", "COLUMNS"].map(
  //     (axisName) => {
  //       if (cube === undefined) {
  //         return [];
  //       }

  //       const axis = (mdx?.axes || []).find(({ name }) => name === axisName);
  //       if (axis === undefined) {
  //         return [];
  //       }

  //       return getLevels(
  //         axis,
  //         cube
  //       ).map(({ dimensionName, hierarchyName, levelName }) =>
  //         quote(dimensionName, hierarchyName, levelName)
  //       );
  //     }
  //   );

  //   const measures = getMeasures(mdx);

  // return {
  //   rows: levelsOnRows,
  //   columns: ["ALL_MEASURES", ...levelsOnColumns],
  //   measures: measures.map((measureName) => `[Measures].[${measureName}]`),
  // };

  const mdx = query.mdx;

  const measures = [];
  const measureRegex = /\[Measures\].\[([^\]]+)\]/gm;
  let measureResults = measureRegex.exec(mdx);
  while (measureResults) {
    const measure = measureResults[0];
    measures.push(measure);
    measureResults = measureRegex.exec(mdx);
  }

  return {
    rows: [], //levelsOnRows,
    columns: ["ALL_MEASURES"], //["ALL_MEASURES", ...levelsOnColumns],
    measures: _.uniq(measures),
  };
};
