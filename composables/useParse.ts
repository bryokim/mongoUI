import { queryOperatorMapping, comparisonOperators } from "#imports";

/**
 * Object constructed from a key-value pair.
 */
interface FilterObject {
  key: string;
  value: string;
  operator: string;
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
      item.value = item.value.trim();
      item.operator = item.operator || "=";

      const parsedOperatorAndValue = parseOperatorAndValueToJSON(
        item.operator,
        item.value
      );

      parsedFilter[item.key] = parsedFilter[item.key] || <SimpleObject>{};

      parsedFilter[item.key][parsedOperatorAndValue.operator] = parseKeyValue(
        parsedOperatorAndValue.value
      );

      if (parsedFilter[item.key][parsedOperatorAndValue.operator] === "0")
        parsedFilter[item.key][parsedOperatorAndValue.operator] = 0;
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

      const parsedValue = [];

      if (typeof value === "object" && !Array.isArray(value)) {
        parsedValue.push(...parseJSONValue(value));
      } else {
        parsedValue.push(["=", value]);
      }

      for (const v of parsedValue) {
        if (["=", "!="].includes(v[0])) {
          value = Array.isArray(v[1]) ? `[ ${v[1]} ]` : v[1];
        } else if (["[ ]", "![ ]"].includes(v[0])) {
          value = `[ ${v[1].map((i: string) =>
            /^\s+.+$/.test(i) || /^.+\s+$/.test(i) ? `'${i}'` : i
          )} ]`;
        } else {
          value = v[1].toString();
        }

        items.push({
          key: key.toString(),
          value: value,
          operator: v[0],
          checked: false,
        });
      }
    }

    return items;
  };

  /**
   * Parses a JSON value to operator and value assigned.
   * 
   * @example
   * const filter = { "name": { "$eq": "One" } };
   * 
   * const operatorAndValue = parseJSONValue(filter.name);
   * 
   * console.log(operatorAndValue) // [ [ "=", "One" ]]
   * 
   * @param jsonValue value containing operator and value assigned to operator.
   * @returns A array of arrays with operator and value.
   */
  const parseJSONValue = (jsonValue: SimpleObject) => {
    const parsedValues = [];

    for (const [operator, value] of Object.entries(jsonValue)) {
      if (comparisonOperators.includes(operator)) {
        parsedValues.push([queryOperatorMapping[operator], value]);
      }
    }

    return parsedValues;
  };

  /**
   * Parses key-value operator and value into JSON and mongodb valid object.
   * 
   * @example
   * const keyValueFilter = {key: 'name', value: 'One', operator: '='};
   * 
   * const JSONValue = parseOperatorAndValueToJSON(keyValueFilter.operator, keyvalueFilter.value);
   * 
   * console.log(JSONValue.operator) // "$eq" 
   * console.log(JSONValue.value) // "One" 
   * 
   * @param operator operator 
   * @param value value assigned.
   * @returns An object containing mapped operator and parsed value.
   */
  const parseOperatorAndValueToJSON = (operator: string, value: string) => {
    const parsedValue: SimpleObject = {};

    if (comparisonOperators.includes(operator)) {
      if (["[ ]", "[]", "![ ]", "![]"].includes(operator)) {
        parsedValue.value = /^\[.+\]$/.test(value)
          ? value
              .slice(1, -1)
              .split(/\s*,\s*/)
              .map((v) => parseKeyValue(v.trim()))
          : value.split(/\s*,\s*/).map((v) => parseKeyValue(v.trim()));
      } else {
        parsedValue.value = /^\[.+\]$/.test(value)
          ? value
              .slice(1, -1)
              .split(/\s*,\s*/)
              .map((v) => parseKeyValue(v.trim()))
          : value;
      }
      parsedValue.operator = queryOperatorMapping[operator];
    }

    return parsedValue;
  };

  /**
   * Parses a value passed to a key.
   * 
   * @example
   * const keyValueFilter = { key: 'name', value: '123' }
   * 
   * const parsedValue = parseKeyValue(keyValueFilter.value);
   * 
   * console.log(parsedValue) // 123
   * 
   * @param value key value to parse.
   * @returns parsed value.
   */
  const parseKeyValue = (value: string) => {
    if (/^'\d+'$/.test(value) || /^"\d+"$/.test(value)) {
      // If value is a quoted number don't parse it as number.
      const output = /^['"](\d+)['"]$/.exec(value);

      return output ? output[1] : value;
    }

    if (Array.isArray(value)) {
      return value.map((v) =>
        /^'.+'$/.test(v) || /^".+"$/.test(v) ? v.slice(1, -1) : v
      );
    }
    return /^\d+$/.test(value) ? parseInt(value) : value;
  };

  return {
    parseFilterToJSON,
    parseFilterFromJSON,
  };
};
