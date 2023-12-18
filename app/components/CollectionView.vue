<template>
  <v-row>
    <v-col cols="9">
      <v-card v-if="noDocuments" color="warning" rounded="lg" class="py-0 mb-2"
        ><v-card-text class="pa-1 ms-4">
          <v-icon color="black">mdi-alert-circle</v-icon>
          {{ collection }} is empty
        </v-card-text>
      </v-card>

      <v-card v-else height="75vh" color="#1B1E2C" rounded="lg">
        <v-infinite-scroll
          height="75vh"
          :items="items"
          mode="manual"
          @load="load"
        >
          <v-container>
            <JsonViewer
              v-for="item in items"
              :value="item"
              :key="item"
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
            <v-alert v-if="!noDocuments" type="warning"
              >No more documents!</v-alert
            >
          </template>
          <template v-slot:load-more="{ props }">
            <v-btn
              icon="mdi-refresh"
              variant="text"
              size="small"
              v-bind="props"
            ></v-btn>
          </template>
        </v-infinite-scroll>
      </v-card>
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
    };
  },
  methods: {
    async load({ side, done }) {
      const { findDocumentsInPage } = useDb();

      const documents = await findDocumentsInPage(
        this.database,
        this.collection,
        side
      );

      if (documents.length === 0) {
        done("empty");
      } else {
        this.items.push(...documents);
        done("ok");
      }
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
