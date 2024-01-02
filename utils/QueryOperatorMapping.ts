const mappings: Iterable<readonly [string, string]> = [
  // From JSON to key-value
  ["$eq", "="],
  ["$ne", "!="],
  ["$lt", "<"],
  ["$lte", "<="],
  ["$gt", ">"],
  ["$gte", ">="],
  ["$in", "[ ]"],
  ["$nin", "![ ]"],

  // From key-value to JSON.
  ["=", "$eq"],
  ["!=", "$ne"],
  ["<", "$lt"],
  ["<=", "$lte"],
  [">", "$gt"],
  [">=", "$gte"],
  ["[ ]", "$in"],
  ["[]", "$in"],
  ["![ ]", "$nin"],
  ["![]", "$nin"],
];

export const queryOperatorMapping = Object.freeze(Object.fromEntries(mappings));

export const comparisonOperators: readonly string[] = [
  // JSON
  "$eq",
  "$ne",
  "$lt",
  "$lte",
  "$gt",
  "$gte",
  "$in",
  "$nin",

  // key-value
  "=",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "[]",
  "[ ]",
  "![]",
  "![ ]",
];
