<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    persistent
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <VBtnBlock color="primary-2" v-bind="props" prepend-icon="mdi-file-find">
        Find document
      </VBtnBlock>
    </template>
    <v-card>
      <v-toolbar dark color="surface" :elevation="10">
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Find document</v-toolbar-title>
      </v-toolbar>

      <v-row>
        <v-col cols="3"></v-col>
        <v-col cols="6">
          <v-sheet>
            <p class="mb-5">Enter the filter below</p>

            <div class="mb-10">
              <ClientOnly>
                <CodeEditor
                  class="mb-1"
                  v-model="filter"
                  :languages="[['json', 'JSON']]"
                  :line-nums="true"
                  theme="vs2015"
                  width="100%"
                >
                </CodeEditor>
              </ClientOnly>
              <div v-if="filterError" class="text-center">
                <v-chip
                  variant="flat"
                  color="danger"
                  prepend-icon="mdi-alert-circle"
                  >{{ filterError }}</v-chip
                >
              </div>
            </div>

            <VBtnBlock color="success" @click="find"
              >Find Document(s)</VBtnBlock
            >
          </v-sheet>

          <v-sheet
            class="mt-16 pa-1"
            rounded="lg"
            :elevation="10"
            color="#1b1e2c"
          >
            <v-row>
              <v-col cols="6">
                <h4 class="mb-3 text-end">Result</h4>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="2">
                <v-chip
                  color="teal"
                  prepend-icon="mdi-file-document-multiple"
                  class=""
                >
                  Count: {{ resultCount }}</v-chip
                >
              </v-col>
            </v-row>
            <v-infinite-scroll v-if="result.length > 0" :height="400" :items="result" :onLoad="load">
              <v-container>
                <JsonViewer
                  theme="my-theme"
                  v-for="(item, index) in result"
                  :key="index"
                  :value="item"
                ></JsonViewer>
              </v-container>
            </v-infinite-scroll>

            <v-container v-if="noDocumentsFound">
              No documents found.
            </v-container>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import hljs from "highlight.js";
import CodeEditor from "simple-code-editor/CodeEditor";
import JsonViewer from "vue-json-viewer/ssr";

export default {
  props: ["database", "collection"],
  components: {
    CodeEditor,
    JsonViewer,
  },
  data() {
    return {
      dialog: false,
      filter: "",
      result: [],
      resultCount: 0,
      noDocumentsFound:false, 
      timeout: 4000,
      filterError: "",
    };
  },
  methods: {
    async find() {
      if (!this.validate()) return;

      this.result = [];
      this.noDocumentsFound = false;
      this.resultCount = 0;

      const { findDocumentsInPage, setPage, countDocuments } = useDb();

      setPage(0, this.database, this.collection);
      this.result = await findDocumentsInPage(
        this.database,
        this.collection,
        "end",
        JSON.parse(this.filter)
      );

      if (this.result.length > 0) {
        this.resultCount = await countDocuments(
          this.database,
          this.collection,
          JSON.parse(this.filter)
        );
      } else {
        this.noDocumentsFound = true;
      }
    },
    async load({ done }) {
      const { findDocumentsInPage } = useDb();

      const documents = await findDocumentsInPage(
        this.database,
        this.collection,
        "end",
        JSON.parse(this.filter)
      );

      if (documents.length > 0) {
        this.result.push(...documents);
        done("ok");
      } else {
        done("empty");
      }
    },
    validate() {
      const { validateJSON } = useValidate();

      this.filterError = "";

      const filterIsValid = validateJSON(this.filter, "filter");
      if (typeof filterIsValid === "string") {
        this.filterError = filterIsValid;
        return false;
      }

      return true;
    },
    close() {
      this.dialog = false;
      this.result = [];
      this.resultCount = 0;
      this.noDocumentsFound = false;
    },
  },
};
</script>
