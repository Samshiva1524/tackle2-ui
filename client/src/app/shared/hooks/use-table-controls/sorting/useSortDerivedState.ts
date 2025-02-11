import i18n from "@app/i18n";
import { ISortState } from "./useSortState";

export interface ISortDerivedStateArgs<
  TItem,
  TSortableColumnKey extends string
> {
  items: TItem[];
  getSortValues?: (
    item: TItem
  ) => Record<TSortableColumnKey, string | number | boolean>;
}

export const useSortDerivedState = <TItem, TSortableColumnKey extends string>({
  sortState: { activeSort },
  items,
  getSortValues,
}: ISortDerivedStateArgs<TItem, TSortableColumnKey> & {
  sortState: ISortState<TSortableColumnKey>;
}) => {
  if (!getSortValues || !activeSort) {
    return { sortedItems: items };
  }

  let sortedItems = items;
  sortedItems = [...items].sort((a: TItem, b: TItem) => {
    let aValue = getSortValues(a)[activeSort.columnKey];
    let bValue = getSortValues(b)[activeSort.columnKey];
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.replace(/ +/g, "");
      bValue = bValue.replace(/ +/g, "");
      const aSortResult = aValue.localeCompare(bValue, i18n.language);
      const bSortResult = bValue.localeCompare(aValue, i18n.language);
      return activeSort.direction === "asc" ? aSortResult : bSortResult;
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return activeSort.direction === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      if (aValue > bValue) return activeSort.direction === "asc" ? -1 : 1;
      if (aValue < bValue) return activeSort.direction === "asc" ? -1 : 1;
    }

    return 0;
  });

  return { sortedItems };
};
