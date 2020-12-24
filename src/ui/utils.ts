import _update from "lodash/update";
import { produce, Draft } from "immer";

export const update = function <T extends object = any>(
  object: T,
  path: string | number | (string | number)[],
  updater: (value: any) => any
): T {
  return produce(object, (draft: Draft<T>) => {
    _update(draft, path, updater);
  });
};
