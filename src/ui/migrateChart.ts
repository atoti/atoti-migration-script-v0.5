import _mapValues from "lodash/mapValues";
import _omit from "lodash/omit";
import _isArray from "lodash/isArray";
import _ from "lodash";

import { PlotlyWidgetState } from "./chart";
// import {
//   getFilters,
//   MdxSelect,
//   MdxString,
//   parse,
//   setFilters,
//   stringify,
// } from "@activeviam/mdx";
import { _getServerKeyInLegacyWidgetState } from "./_getServerKeyInLegacyWidgetState";
import { DataModel } from "./dataModel";
import { update } from "./utils";

/**
 * Returns the converted chart widget state, ready to be used by ActiveUI 5.
 */
export function migrateChart(
  // Legacy widget states are not typed.
  legacyChartState: any,
  serverUrlToKeyMapping?: { [serverUrl: string]: string },
  dataModels?: { [serverKey: string]: DataModel }
): PlotlyWidgetState {
  const {
    type,
    ...configuration
  } = legacyChartState?.value?.body?.configuration;
  const name = legacyChartState?.name;

  const query = _omit(legacyChartState?.value?.body?.query, ["serverUrl"]);
  // const mdx = parse<MdxSelect>(query.mdx);
  // const filters = getFilters(mdx).map(({ mdx }: { mdx: any }) =>
  //   stringify(mdx)
  // );
  // const mdxWithoutFilters = setFilters(mdx, []);
  // query.mdx = stringify(mdxWithoutFilters);

  // Legacy charts had their queries stored at a different place than other legacy widgets.
  const stateWithServerUrlAtTheSamePlaceAsOtherLegacyWidgets = update(
    legacyChartState,
    ["value", "body"],
    (body) => {
      body.serverUrl = legacyChartState?.value?.body?.query?.serverUrl;
      return body;
    }
  );

  const serverKey = _getServerKeyInLegacyWidgetState(
    stateWithServerUrlAtTheSamePlaceAsOtherLegacyWidgets,
    serverUrlToKeyMapping,
    dataModels
  );

  // add ctx values
  if (query.contextValues !== undefined) {
    query.context = _.cloneDeep(query.contextValues);
    Reflect.deleteProperty(query, "contextValues");
  }
  if (query.context === undefined) {
    query.context = {};
  }
  query.context["queriesResultLimit.intermediateSize"] = 1000000;
  query.context["queriesResultLimit.transientSize"] = 10000000;

  if (type.startsWith("plotly-")) {
    return {
      ...configuration,
      name,
      // filters,
      serverKey,
      query,
      widgetKey: type,
    };
  }

  const mapping = _mapValues(
    legacyChartState?.value?.body?.configuration?.mapping,
    (attributeMapping) => {
      return _isArray(attributeMapping.from)
        ? attributeMapping.from
        : [attributeMapping.from];
    }
  );
  const subplots = {
    ...(mapping.row && { horizontalSubplots: mapping.rows }),
    ...(mapping.column && { verticalSubplots: mapping.rows }),
  };

  switch (type) {
    case "combo-line":
      return {
        mapping: {
          xAxis: mapping.x,
          values: mapping.y,
          ...subplots,
        },
        // filters,
        query,
        serverKey,
        name,
        widgetKey: "plotly-line-chart",
      };
    case "combo-line-area":
      return {
        mapping: {
          xAxis: mapping.x,
          values: mapping.y,
          ...subplots,
        },
        // filters,
        query,
        serverKey,
        name,
        widgetKey: "plotly-area-chart",
      };
    case "combo-histogram":
      return {
        mapping: {
          xAxis: mapping.x,
          values: mapping.y,
          ...subplots,
        },
        // filters,
        query,
        serverKey,
        name,
        widgetKey: "plotly-stacked-column-chart",
      };
    case "combo-horizontal-histogram":
      return {
        mapping: {
          yAxis: mapping.y,
          values: mapping.x,
          ...subplots,
        },
        // filters,
        query,
        serverKey,
        name,
        widgetKey: "plotly-stacked-bar-chart",
      };
    case "pie":
      return {
        mapping: {
          values: mapping.angle,
          sliceBy: mapping.color,
          ...subplots,
        },
        // filters,
        query,
        serverKey,
        name,
        widgetKey: "plotly-pie-chart",
      };
    case "scatter":
      return {
        mapping: {
          xValues: mapping.x,
          yValues: mapping.y,
          size: mapping.r,
          color: mapping.color,
          splitBy: mapping.cardinality,
          ...subplots,
        },
        // filters,
        query,
        serverKey,
        name,
        widgetKey: "plotly-scatter-plot",
      };
    default: {
      // eslint-disable-next-line no-console
      console.warn(
        `Unsupported legacy chart type: "${type}". The widget ("${legacyChartState.name}") will be copied as is. It might not work correctly in ActiveUI5.`
      );
      return {
        name: legacyChartState?.name,
        ...legacyChartState?.value?.body,
      };
    }
  }
}
