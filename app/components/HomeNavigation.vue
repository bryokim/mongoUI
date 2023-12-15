<template>
  <v-navigation-drawer
    app
    permanent
    v-model="drawer"
    :rail="rail"
    @click="rail = false"
  >
    <template v-slot:prepend>
      <v-list-item
        title="Databases"
        class="text-center"
        prepend-icon="mdi-database"
        style="font-family: Poppins, sans-serif; font-weight: 500"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>
    </template>

    <v-divider color="white"></v-divider>

    <v-list nav density="compact" v-model:opened="open">
      <v-list-subheader
        title="non empty"
        color="primary"
        inset
      ></v-list-subheader>

      <v-list-group v-for="(db, j) in nonEmpty" :key="j" :value="db.name">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-database-outline"
            :title="db.name"
            color="primary"
            @click="openDb(db.name)"
          ></v-list-item>
        </template>
        <v-list-item
          v-for="(col, i) in db.collections"
          :key="i"
          :title="col"
          :to="'/home/' + `${db.name}/${col}`"
        ></v-list-item>
      </v-list-group>
    </v-list>

    <div v-if="empty">
      <v-divider color="white"></v-divider>
      <v-list nav density="compact" v-model:opened="open">
        <v-list-subheader
          title="empty"
          color="warning"
          inset
        ></v-list-subheader>

        <v-list-group v-for="(db, j) in empty" :key="j" :value="db.name">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-database-alert"
              :title="db.name"
              color="warning"
              @click="openDb(db.name)"
            ></v-list-item>
          </template>
          <v-list-item
            v-for="(col, i) in db.collections"
            :key="i"
            :title="col"
            :to="'/home/' + `${db.name}/${col}`"
          ></v-list-item>
        </v-list-group>
      </v-list>
    </div>

    <template v-slot:append>
      <v-dialog
        v-model="dialog"
        max-width="400px"
        :disabled="!canCreateDatabase"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            prepend-icon="mdi-database-plus"
            class="mb-5"
            v-bind="props"
          >
            <VBtnBlock color="primary" :disabled="!canCreateDatabase"
              >New Database</VBtnBlock
            >
          </v-list-item>
        </template>

        <v-card rounded="lg" theme="dark">
          <v-card-text>
            <div class="text-center mb-5">New database</div>
            <v-form
              v-model="valid"
              fast-fail
              validate-on="input"
              @submit.prevent="createDatabase"
            >
              <v-text-field
                variant="underlined"
                v-model="newDatabase.database"
                label="Database"
                :rules="[rules.dbIsValid]"
              ></v-text-field>
              <v-text-field
                variant="underlined"
                v-model="newDatabase.collection"
                label="Collection"
                :rules="[rules.required]"
              ></v-text-field>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text="cancel" @click="closeDialog"></v-btn>
                <v-btn text="create" color="success" type="submit"></v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  setup() {
    return {
      rolesInfo: useRolesInfo().value,
    };
  },
  data() {
    return {
      valid: false,
      dialog: false,
      drawer: true,
      rail: false,
      open: [this.$route.params.slug[0]],
      nonEmpty: useDbsInfo().value?.nonEmpty,
      empty: useDbsInfo().value?.empty,
      counter: useState("counter", () => 0),
      newDatabase: {
        database: "",
        collection: "",
      },
      rules: {
        required: (value) => value !== "" || "required",
        dbIsValid: async (value) => {
          const isValid = await useValidate().validateDatabase(value);

          return isValid;
        },
      },
    };
  },
  computed: {
    canCreateDatabase() {
      return (
        useRolesInfo().value.superuser ||
        useRolesInfo().value.createDatabase
      );
    },
  },
  emits: ["openedDatabase"],
  methods: {
    async getDbsAndCols() {
      if (this.counter % 10 === 0) {
        const { getDbsInfo } = useDb();

        await getDbsInfo();
      }

      this.counter++;
      this.nonEmpty = useDbsInfo().value?.nonEmpty;
      this.empty = useDbsInfo().value?.empty;
    },
    openDb(value) {
      this.$emit("openedDatabase", value);
    },
    closeDialog() {
      this.dialog = false;

      // Restore newDatabase to default.
      this.newDatabase = {
        database: "",
        collection: "",
      };
    },
    async createDatabase(values) {
      const { valid } = await values;

      if (valid) {
        const { createDb } = useDb();

        const { database, collection } = this.newDatabase;

        await createDb(database, collection);

        // Update the empty databases with new values.
        this.empty = useDbsInfo().value.empty;

        this.closeDialog();

        // navigate to the new database.
        this.$router.push(`/home/${database}`);
      }
    },
  },
  async mounted() {
    await this.getDbsAndCols();
  },
};
</script>
