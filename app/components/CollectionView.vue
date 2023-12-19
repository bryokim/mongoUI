<template>
  <v-row class="pa-0">
    <v-col cols="9" class="pa-0">
      <v-card v-if="noDocuments" color="warning" rounded="lg" class="py-0 mb-2"
        ><v-card-text class="pa-1 ms-4">
          <v-icon color="black">mdi-alert-circle</v-icon>
          {{ collection }} is empty. If you added documents and don't see them,
          reload page
        </v-card-text>
      </v-card>

      <v-container v-else class="pt-0">
        <v-form
          ref="form"
          v-model="validFilter"
          validate-on="input"
          @submit.prevent="find"
        >
          <v-row>
            <v-col cols="10">
              <v-text-field
                v-if="foundItems.length === 0"
                v-model="filter"
                label="Find"
                placeholder='{ "name" : "one", "_id" : 456778 }'
                :rules="[rules.filterIsValid]"
                variant="outlined"
                density="compact"
                class="ma-0 pa-0"
                clearable
                @click:clear="clearFoundItems"
                @click:append="find"
              >
              </v-text-field>
              <v-text-field
                v-else
                class="ma-0 pa-0"
                density="compact"
                variant="solo"
                readonly
                >Showing results for {{ filter }}</v-text-field
              >
            </v-col>
            <v-col>
              <VBtnBlock
                v-if="foundItems.length === 0"
                type="submit"
                color="success"
                text="search"
                prepend-icon="mdi-magnify"
              ></VBtnBlock>
              <VBtnBlock
                v-else
                @click="clearFoundItems"
                color="warning"
                text="cancel"
                prepend-icon="mdi-close"
              ></VBtnBlock>
            </v-col>
          </v-row>
        </v-form>

        <v-card height="70vh" color="#1B1E2C" rounded="lg">
          <v-infinite-scroll
            height="70vh"
            :items="items"
            mode="manual"
            @load="load"
          >
            <v-container>
              <JsonViewer
                v-if="foundItems.length > 0"
                v-for="(foundItem, i) in foundItems"
                :value="foundItem"
                :key="i"
                theme="my-theme"
                copyable
              >
              </JsonViewer>
              <JsonViewer
                v-else
                v-for="(item, j) in items"
                :value="item"
                :key="j"
                theme="my-theme"
                copyable
              ></JsonViewer>
            </v-container>

            <template v-slot:error="{ props }">
              <v-alert type="error">
                <div class="d-flex justify-space-between align-center">
                  Something went wrong...
                  <v-btn
                    color="white"
                    variant="outlined"
                    size="small"
                    v-bind="props"
                  >
                    Retry
                  </v-btn>
                </div>
              </v-alert>
            </template>
            <template v-slot:empty>
              <v-alert
                v-if="!noDocuments && foundItems.length === 0"
                type="warning"
                >No more documents!</v-alert
              >
            </template>
            <template v-slot:load-more="{ props }">
              <v-btn
                v-if="foundItems.length === 0"
                icon="mdi-refresh"
                variant="text"
                v-bind="props"
              ></v-btn>
            </template>
          </v-infinite-scroll>
        </v-card>
      </v-container>
    </v-col>

    <v-col>
      <InsertDocument
        v-if="canInsertDocument"
        :database="database"
        :collection="collection"
        @inserted="load({ side: 'end', done: console.log, inserted: true })"
      ></InsertDocument>
    </v-col>
  </v-row>
</template>

<script>
import JsonViewer from "vue-json-viewer/ssr";

export default {
  components: {
    JsonViewer,
  },
  props: ["collection", "database"],
  data() {
    return {
      scrollInvoked: 0,
      items: [],
      noDocuments: false,
      filter: "{}",
      validFilter: false,
      rules: {
        filterIsValid: (value) => {
          return useValidate().validateFilter(value);
        },
      },
      foundItems: [],
    };
  },
  computed: {
    canInsertDocument() {
      return (
        useRolesInfo().value.superuser ||
        useRolesInfo().value.writeDocument?.includes(this.database)
      );
    },
  },
  methods: {
    async load({ side, done, inserted = false }) {
      // Don't load any documents if finding documents.
      if (this.foundItems.length > 0) {
        done("ok");
      } else {
        const { findDocumentsInPage } = useDb();

        const documents = await findDocumentsInPage(
          this.database,
          this.collection,
          side,
          inserted
        );

        if (documents.length === 0) {
          done("empty");
        } else {
          this.items.push(...documents);
          done("ok");
        }
      }
    },
    async find() {
      if (this.$refs.form.validate()) {
        const { findDocuments } = useDb();

        const documents = await findDocuments(
          this.database,
          this.collection,
          JSON.parse(this.filter)
        );

        this.foundItems =
          documents.length > 0 ? documents : ["No documents matched"];
      }
    },
    clearFoundItems() {
      this.foundItems = [];
    },
  },
  async mounted() {
    const { setPage } = useDb();

    // Restore to the first page.
    setPage(0, this.database, this.collection);

    await this.load({ side: "end", done: console.log });

    this.noDocuments = this.items.length === 0 ? true : false;
  },
};
</script>
