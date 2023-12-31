<template>
  <v-row v-if="validDatabase()">
    <v-col cols="12" v-if="empty" class="mb-0">
      <v-card color="warning" rounded="lg" class="py-0 mb-0"
        ><v-card-text class="pa-1 ms-4">
          <v-icon color="black">mdi-alert-circle</v-icon>
          {{ database }} is empty and will be lost after closing connection
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6">
      <v-card
        elevation="10"
        class="mb-10 overflow-y-auto mx-auto"
        rounded="lg"
        max-width="400px"
        max-height="550px"
      >
        <v-card-text class="pt-0">
          <v-list nav>
            <v-list-item inset class="text-h6">
              <template v-slot:append>
                <v-tooltip
                  activator="parent"
                  location="top"
                  text="Add collection"
                >
                </v-tooltip>
                <v-icon
                  v-if="canCreateCollection"
                  color="white"
                  size="small"
                  @click="createCollectionInput = !createCollectionInput"
                  >mdi-plus-circle-outline</v-icon
                >
              </template>
              Collections
            </v-list-item>

            <v-divider color="success" thickness="2px"></v-divider>

            <v-list-item v-if="createCollectionInput" focus>
              <div>
                <p
                  v-if="createCollectionError"
                  class="mb-3 text-center text-danger rounded"
                >
                  {{ createCollectionError }}
                </p>
              </div>
              <v-form
                v-model="collectionValid"
                @submit.prevent="createCollection"
              >
                <v-text-field
                  v-model="newCollection"
                  color="primary"
                  variant="underlined"
                  :append-icon="newCollection ? 'mdi-plus' : 'mdi-close'"
                  :rules="[rules.collectionIsValid]"
                  single-line
                  hide-details
                  focused
                  @click:append="createCollection"
                ></v-text-field>
              </v-form>
            </v-list-item>

            <v-list-item
              v-for="(collection, i) in collections"
              :key="i"
              :title="collection"
              :value="collection"
              :to="`/home/${database}/${collection}`"
              class="v-card--hover"
            ></v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <v-spacer></v-spacer>

    <v-col cols="4">
      <v-card rounded="lg" class="mb-14" v-if="canDropDatabase">
        <v-card-subtitle> Database Actions </v-card-subtitle>
        <v-card-text>
          <div>
            <p
              v-if="dropDatabaseError"
              class="mb-3 text-center text-danger rounded"
            >
              {{ dropDatabaseError }}
            </p>
          </div>
          <v-dialog
            v-model="dialog"
            max-width="500px"
            transition="dialog-top-transition"
          >
            <template v-slot:activator="{ props }">
              <VBtnBlock
                v-bind="props"
                class="mb-6"
                color="#F5516E"
                prepend-icon="mdi-delete-alert"
                >Drop Database</VBtnBlock
              >
            </template>

            <v-card rounded="lg" theme="dark">
              <v-card-text>
                <v-icon size="large" color="danger" class="me-2">
                  mdi-delete-alert
                </v-icon>
                Are you sure you want to drop {{ database }}?
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text="cancel" @click="closeDialog"></v-btn>
                <v-btn text="drop" color="danger" @click="dropDatabase"></v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </v-card>

      <v-list lines="two">
        <v-list-item inset class="text-h6">
          <template v-slot:prepend>
            <v-icon color="white">mdi-information-variant</v-icon>
          </template>
          Database Info
        </v-list-item>

        <v-divider color="success" thickness="2px"></v-divider>

        <v-list-item title="user" :subtitle="clientInfo.userInfo.user">
          <template v-slot:prepend>
            <v-icon color="white">mdi-account</v-icon>
          </template>
        </v-list-item>

        <v-list-item title="roles" :subtitle="roles?.toString() || 'None'">
          <template v-slot:prepend>
            <v-icon color="white">mdi-file-edit</v-icon>
          </template>
        </v-list-item>

        <v-list-item title="size" subtitle="kim">
          <template v-slot:prepend>
            <v-icon color="white">mdi-file-document-multiple</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-col>
    <v-spacer></v-spacer>
  </v-row>

  <div v-else>
    <v-alert
      type="warning"
      :text="`${database} not found`"
      rounded="lg"
      class="mx-auto mb-16"
    ></v-alert>

    <v-card
      theme="dark"
      max-width="400px"
      rounded="lg"
      elevation="4"
      class="mx-auto"
      v-if="canCreateDatabase"
    >
      <v-card-subtitle class="mt-4">create {{ database }}</v-card-subtitle>
      <v-card-text>
        <v-form v-model="valid" @submit.prevent="createDatabase" fast-fail>
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
            <VBtnBlock
              color="primary"
              variant="elevated"
              class="my-3"
              type="submit"
            >
              create {{ database }}
            </VBtnBlock>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ["database"],
  data() {
    return {
      clientInfo: useClientInfo().value,
      valid: false,
      dialog: false,
      dropDatabaseError: "",
      newDatabase: {
        database: this.database,
        collection: "",
      },
      rules: {
        required: (value) => value !== "" || "required",
        dbIsValid: async (value) => {
          const isValid = await useValidate().validateDatabase(value);

          return isValid;
        },
        collectionIsValid: async (value) => {
          const isValid = await useValidate().validateCollection(
            this.database,
            value
          );

          return isValid;
        },
      },
      newCollection: "",
      collectionValid: false,
      createCollectionInput: false,
      createCollectionError: "",
    };
  },
  computed: {
    collections() {
      return (
        useDbsInfo().value?.nonEmpty.filter(
          (dbInfo) => dbInfo.name === this.database
        )[0]?.collections ||
        useDbsInfo().value?.empty.filter(
          (dbInfo) => dbInfo.name === this.database
        )[0]?.collections
      );
    },
    roles() {
      return (
        useDbsInfo().value?.nonEmpty.filter(
          (dbInfo) => dbInfo.name === this.database
        )[0]?.roles ||
        useDbsInfo().value?.empty.filter(
          (dbInfo) => dbInfo.name === this.database
        )[0]?.roles
      );
    },
    empty() {
      return useDbsInfo().value?.empty.some(
        (dbInfo) => dbInfo.name === this.database
      );
    },
    canCreateDatabase() {
      return (
        useRolesInfo().value.superuser || useRolesInfo().value.createDatabase
      );
    },
    canDropDatabase() {
      return (
        useRolesInfo().value.superuser ||
        useRolesInfo().value.dropDatabases?.includes(this.database)
      );
    },
    canCreateCollection() {
      return (
        useRolesInfo().value.superuser ||
        useRolesInfo().value.collections?.includes(this.database)
      );
    },
  },
  methods: {
    validDatabase() {
      return (
        useDbsInfo().value?.nonEmpty?.some(
          (dbInfo) => dbInfo.name === this.database
        ) ||
        useDbsInfo().value?.empty?.some(
          (dbInfo) => dbInfo.name === this.database
        )
      );
    },
    async createDatabase(values) {
      const { valid } = await values;

      if (valid) {
        const { createDb } = useDb();

        const { database, collection } = this.newDatabase;

        await createDb(database, collection);

        // navigate to the new database.
        this.$router.push(`/home/${database}`);
      }
    },
    async dropDatabase() {
      const { dropDb } = useDb();

      try {
        await dropDb(this.database);

        // navigate to /home after dropping database.
        this.$router.push("/home");

        this.dropDatabaseError = "";
      } catch (error) {
        console.log(error);
        this.dropDatabaseError = error.data.message;
      }

      this.closeDialog();
    },
    closeDialog() {
      this.dialog = false;
    },
    async createCollection() {
      if (this.collectionValid) {
        try {
          await useDb().createCollection(this.database, this.newCollection);
          this.createCollectionInput = false;
          this.createCollectionError = "";

          // Navigate to the new collection
          this.$router.push(`/home/${this.database}/${this.newCollection}`);
        } catch (error) {
          this.createCollectionError = error.data.message;
        }

        this.newCollection = "";
      } else if (this.newCollection === "") {
        this.createCollectionInput = false;
        this.createCollectionError = "";
      }
    },
  },
};
</script>
