export interface Page {
  // database names
  [propName: string]: {
    // collection names in the database.
    [propName: string]: number;
  };
}

/**
 * Holds the page where a certain collection in a certain database is at.
 * That page is the one that will be loaded next and displayed to the user.
 *
 * If a collection is not in the `usePage` value, the default page is 0.
 * After page 0 has been displayed, the collection should be added to the
 * `usePage` value and its page set to 1.
 * Subsequent page displays should increment the page by 1.
 * 
 * The page is 0 indexed.
 *
 * @example
 * import { usePage } from "~/composables/usePage";
 *
 * usePage().value = {
 *  database_name: {
 *      collection_name: 10 // The current page of the collection that should be displayed.
 *  }
 * }
 *
 * @returns
 */

export const usePage = () => {
  return useState<Page>("page", () => ({}));
};
