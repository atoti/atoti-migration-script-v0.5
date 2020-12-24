// import { Query } from "@activeviam/activepivot-client";
// import { MdxString } from "@activeviam/mdx";
import _pick from "lodash/pick";

/**
 * Returns the query contained in `legacyWidgetState`.
 */
export const _getQueryInLegacyWidgetState = (
  // Legacy widget states are not typed.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  legacyWidgetState: any
): any =>
  _pick(legacyWidgetState?.value?.body, ["mdx", "contextValues", "updateMode"]);
