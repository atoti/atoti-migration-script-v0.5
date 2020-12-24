import { DataModel } from "./dataModel";

/**
 * Returns the serverKey for `legacyWidgetState`.
 */
export const _getServerKeyInLegacyWidgetState = (
  // Legacy widget states are not typed.
  legacyWidgetState: any,
  serverUrlToKeyMapping?: { [serverUrl: string]: string },
  dataModels?: { [serverKey: string]: DataModel }
): string => {
  const serverKey =
    serverUrlToKeyMapping?.[legacyWidgetState?.value?.body?.serverUrl];
  if (serverKey !== undefined) {
    return serverKey;
  }

  // "default" is the serverKey used by Atoti.
  const fallbackServerKey = dataModels ? Object.keys(dataModels)[0] : "default";

  console.warn(
    `Could not find the serverKey for widget "${legacyWidgetState.name}". Using "${fallbackServerKey}" instead.`
  );

  return fallbackServerKey;
};
