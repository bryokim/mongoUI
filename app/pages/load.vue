<template>
  <v-container>
    <h1
      class="text-center mb-10 text-decoration-underline"
      style="font-family: Poppins; font-weight: 400"
    >
      Saved connections
    </h1>
    <v-data-table :items="items" :headers="headers">
      <template v-slot:item.actions="{ item }">
        <ConnectFromSave :item="item"></ConnectFromSave>

        <EditSaved :item="item" @updated="loadFiles"></EditSaved>

        <DeleteSaved :item="item" @deleted="loadFiles"></DeleteSaved>
      </template>

      <template v-slot:no-data>
        <h4 class="my-10">You do not have any saved connections</h4>

        <v-sheet width="300" class="mx-auto">
          <NuxtLink to="/connect" class="text-decoration-none">
            <VBtnBlock color="success" class="mb-10"
              >Create new connection</VBtnBlock
            >
          </NuxtLink>
        </v-sheet>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      headers: [
        {
          title: "Name",
          align: "start",
          key: "name",
        },
        { title: "User", key: "user" },
        { title: "Host", key: "host" },
        { title: "Port", key: "port" },
        { title: "Actions", key: "actions", align: "center", sortable: false },
      ],
    };
  },
  methods: {
    async loadFiles() {
      const data = await $fetch("/api/client/saved");

      this.items = data;
    },
  },
  async mounted() {
    await this.loadFiles();
  },
};
</script>
