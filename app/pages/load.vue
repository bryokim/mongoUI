<template>
  <v-container>
    <h1
      class="text-center mb-10 text-decoration-underline"
      style="font-family: Poppins; font-weight: 500"
    >
      Saved connections
    </h1>
    <v-data-table :items="items" :headers="headers">
      <template v-slot:item.actions="{ item }">
        <v-tooltip location="top" text="connect">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" size="small" class="me-5">
              mdi-connection
            </v-icon>
          </template>
        </v-tooltip>

        <v-tooltip location="top" text="edit">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" size="small" class="me-5">
              mdi-pencil
            </v-icon>
          </template>
        </v-tooltip>

        <v-tooltip location="top" text="delete">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" size="small"> mdi-delete </v-icon>
          </template>
        </v-tooltip>
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
        { title: "Actions", key: "actions", sortable: false },
      ],
    };
  },
  methods: {
    async loadFiles() {
      const data = await $fetch("/api/saved");

      this.items = data;
    },
  },
  async mounted() {
    await this.loadFiles();
  },
};
</script>
