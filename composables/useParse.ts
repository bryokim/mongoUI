
/**
 * Object constructed from a key-value pair.
 */
interface FilterObject {
  key: string;
  value: string;
  checked: boolean;
}

interface SimpleObject {
  [propName: string]: any;
}

export const useParse = () => {
  /**
   * Parses key-value pairs into a valid JSON that can be used as filter
   * for a mongodb command.
   *
   * @see FilterObject
   * @param filters array of objects of type `FilterObject`.
   * @returns a valid JSON that can be passed as filter to a mongodb command.
   */
  const parseFilterToJSON = (filters: FilterObject[]) => {
    const checkedFilters = filters.filter((filter) => filter.checked);

    const parsedFilter: SimpleObject = {};

    for (const item of checkedFilters) {
      // Remove whitespace on both ends.
      item.key = item.key.trim();

      if (/^'\d+'$/.test(item.value) || /^"\d+"$/.test(item.value)) {
        // If value is a quoted number don't parse it as number.
        const output = /^['"](\d+)['"]$/.exec(item.value);

        if (output) parsedFilter[item.key] = output[1];
      } else {
        // Parse to number if it only contains digits.
        parsedFilter[item.key] = /^\d+$/.test(item.value)
          ? parseInt(item.value)
          : item.value;

        if (parsedFilter[item.key] === "0") parsedFilter[item.key] = 0;
      }
    }

    return parsedFilter;
  };

  /**
   * Parses a valid JSON filter to key-value pairs.
   *
   * @param filter JSON to parse.
   * @returns A list of objects containing at least key and value properties.
   */
  const parseFilterFromJSON = (filter: SimpleObject) => {
    const items: FilterObject[] = [];

    for (let [key, value] of Object.entries(filter)) {
      if (typeof value === "string" && /^\d+$/.test(value)) {
        value = `'${value}'`;
      }
      items.push({
        key: key.toString(),
        value: value.toString(),
        checked: false,
      });
    }

    return items;
  };

  return {
    parseFilterToJSON,
    parseFilterFromJSON,
  };
};
