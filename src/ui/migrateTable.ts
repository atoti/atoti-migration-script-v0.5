import { DataModel } from "./dataModel";
import _ from "lodash";
// import {
//   getFilters,
//   MdxSelect,
//   MdxString,
//   parse,
//   setFilters,
//   stringify,
// } from "@activeviam/mdx";
import { TableWidgetState } from "./table";
import { _getMappingFromQuery } from "./_getMappingFromQuery";
import { _getQueryInLegacyWidgetState } from "./_getQueryInLegacyWidgetState";
import { _getServerKeyInLegacyWidgetState } from "./_getServerKeyInLegacyWidgetState";

/**
 * Returns the converted table widget state, ready to be used by ActiveUI 5.
 */
export function migrateTable(
  // Legacy widget states are not typed.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  legacyTableState: any,
  serverUrlToKeyMapping?: { [serverUrl: string]: string },
  dataModels?: { [serverKey: string]: DataModel }
): TableWidgetState {
  const serverKey = _getServerKeyInLegacyWidgetState(
    legacyTableState,
    serverUrlToKeyMapping,
    dataModels
  );
  const query = _getQueryInLegacyWidgetState(legacyTableState);
  const mapping = _getMappingFromQuery(query, dataModels?.[serverKey]);
  //   const mdx = parse<MdxSelect>(query.mdx);
  //   const filters = getFilters(mdx).map(({ mdx }) => stringify(mdx));
  //   const mdxWithoutFilters = setFilters(mdx, []);
  //   query.mdx = stringify(mdxWithoutFilters);

  // add ctx values
  if (query.contextValues !== undefined) {
    query.context = _.cloneDeep(query.contextValues);
    Reflect.deleteProperty(query, "contextValues");
  }
  query.context["queriesResultLimit.intermediateSize"] = 1000000;
  query.context["queriesResultLimit.transientSize"] = 10000000;

  return {
    // filters,
    query,
    mapping,
    name: legacyTableState.name,
    serverKey,
    widgetKey: "pivot-table",
  };
}
