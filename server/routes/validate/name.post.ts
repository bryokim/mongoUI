export default defineEventHandler(async (event) => {
  const { name } = await readBody<{ name: string }>(event);

  return (await useStorage("db").getItem(name)) ? true : false;
});
