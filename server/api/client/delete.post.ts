/**
 * Deletes a saved connection.
 */

export default defineEventHandler(async (event) => {
    const {name} = await readBody<{name: string}>(event);

    await useStorage("db").removeItem(name);
})