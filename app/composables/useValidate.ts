export const useValidate = () => {
  const checkName = async (name: string) => {
    const data = (await $fetch("/validate/name", {
      method: "POST",
      body: { name },
    })) as boolean;

    return data;
  };

  return {
    checkName,
  };
};
