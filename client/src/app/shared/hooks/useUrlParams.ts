import { objectKeys } from "@app/utils/utils";
import React from "react";
import { useLocation, useHistory } from "react-router-dom";

export interface IUseUrlParamsArgs<
  TUrlParamKey extends string,
  TDeserializedParams
> {
  keys: TUrlParamKey[];
  defaultValue: TDeserializedParams;
  serialize: (
    params: Partial<TDeserializedParams>
  ) => Partial<Record<TUrlParamKey, string>>;
  deserialize: (
    urlParams: Partial<Record<TUrlParamKey, string>>
  ) => TDeserializedParams;
}

export type TUrlParamStateTuple<TDeserializedParams> = readonly [
  TDeserializedParams,
  (newParams: Partial<TDeserializedParams>) => void
];

export const useUrlParams = <TUrlParamKey extends string, TDeserializedParams>({
  keys,
  defaultValue,
  serialize,
  deserialize,
}: IUseUrlParamsArgs<
  TUrlParamKey,
  TDeserializedParams
>): TUrlParamStateTuple<TDeserializedParams> => {
  const history = useHistory();

  const setParams = (newParams: Partial<TDeserializedParams>) => {
    // In case setParams is called multiple times synchronously from the same rendered instance,
    // we use document.location here as the current params so these calls never overwrite each other.
    // This also retains any unrelated params that might be present and allows newParams to be a partial update.
    const { pathname, search } = document.location;
    const newSerializedParams = serialize(newParams);
    // Returning undefined for a property from serialize should result in it being omitted (partial update).
    objectKeys(newSerializedParams).forEach((key) => {
      if (newSerializedParams[key] === undefined) {
        delete newSerializedParams[key];
      }
    });
    history.replace({
      pathname,
      search: new URLSearchParams({
        ...Object.fromEntries(new URLSearchParams(search)),
        ...newSerializedParams,
      }).toString(),
    });
  };

  // We use useLocation here so we are re-rendering when the params change
  const urlParams = new URLSearchParams(useLocation().search);
  const serializedParams = keys.reduce(
    (obj, key) => ({ ...obj, [key]: urlParams.get(key) }),
    {} as Partial<Record<TUrlParamKey, string>>
  );
  const allParamsEmpty = keys.every((key) => !serializedParams[key]);
  const params = allParamsEmpty ? defaultValue : deserialize(serializedParams);

  React.useEffect(() => {
    if (allParamsEmpty) setParams(defaultValue);
  }, [allParamsEmpty]);

  return [params, setParams];
};
