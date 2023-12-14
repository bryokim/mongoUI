<template>
  <v-navigation-drawer app permanent v-model="drawer">
    <template v-slot:prepend>
      <v-list-item
        title="Databases"
        class="text-center"
        style="font-family: Poppins, sans-serif; font-weight: 500"
      >
      </v-list-item>
    </template>

    <v-divider></v-divider>

    <v-list nav density="compact">
      <v-list-group
        v-for="(db, j) in dbsAndCols"
        :key="j"
        :value="db.database"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-database-outline"
            :title="db.database"
          ></v-list-item>
        </template>
        <v-list-item
          v-for="(col, i) in db.collections"
          :key="i"
          :title="col"
          :to="'/home/' + `${db.database}/${col}`"
        ></v-list-item>
      </v-list-group>
    </v-list>

    <template v-slot:append>
      <v-list-item prepend-icon="mdi-database-plus" class="mb-5">
        <VBtnBlock color="primary">New Database</VBtnBlock>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      dbsAndCols: [],
    };
  },
  methods: {
    async getDbsAndCols() {
      const dbsAndCols = await $fetch("/api/db/collections", {
        query: { name: useClientInfo().value.name },
      });

      this.dbsAndCols = dbsAndCols;
    },
  },
  async mounted() {
    await this.getDbsAndCols();
  },
};
</script>
