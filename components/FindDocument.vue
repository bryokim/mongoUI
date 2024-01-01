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
          <v-sheet class="mt-5">
            <v-tabs v-model="tab" fixed-tabs color="#FF9D87" class="mb-16">
              <v-tab :value="1" class="text-lowercase"> JSON </v-tab>
              <v-tab :value="2" class="text-lowercase"> key-value pairs </v-tab>
            </v-tabs>

            <v-window v-model="tab">
              <v-window-item :value="1">
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
              </v-window-item>

              <v-window-item :value="2">
                <div class="mb-10">
                  <v-row>
                    <v-col cols="1"></v-col>
                    <v-col cols="5" class="text-center border-b mb-9"
                      >Key</v-col
                    >
                    <v-col cols="5" class="text-center border-b mb-9"
                      >Value</v-col
                    >
                    <v-col cols="1"></v-col>
                    <v-hover
                      v-slot="{ isHovering, props }"
                      v-for="(item, i) in keyValueFilters"
                      :key="i"
                    >
                      <v-col cols="1" v-bind="props" class="py-0">
                        <v-checkbox
                          :model-value="
                            item.key
                              ? (item.checked = item.manual
                                  ? item.checked
                                  : true)
                              : (item.checked = false)
                          "
                          density="compact"
                          variant="underlined"
                          @update:model-value="
                            (item.checked = item.manual
                              ? !item.checked
                              : false) ||
                              (item.manual = item.key ? true : false)
                          "
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="5" v-bind="props" class="py-0">
                        <v-text-field
                          v-model="item.key"
                          density="compact"
                          variant="underlined"
                          clearable
                        ></v-text-field>
                      </v-col>
                      <v-col cols="5" v-bind="props" class="py-0">
                        <v-text-field
                          v-model="item.value"
                          density="compact"
                          variant="underlined"
                          clearable
                        ></v-text-field>
                      </v-col>
                      <v-col cols="1" v-bind="props">
                        <v-icon
                          class="py-0 mdi-24px"
                          :color="isHovering ? 'white' : 'transparent'"
                          @click="removeItem(i)"
                          >mdi-close</v-icon
                        >
                      </v-col>
                    </v-hover>
                    <v-col cols="10"></v-col>
                    <v-col cols="2">
                      <VBtnBlock
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="addItem"
                        >Add</VBtnBlock
                      >
                    </v-col>
                  </v-row>
                </div>
              </v-window-item>
            </v-window>

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
                  Count:
                  {{ resultCount }}</v-chip
                >
              </v-col>
            </v-row>
            <v-infinite-scroll
              v-if="result.length > 0"
              :height="400"
              :items="result"
              :onLoad="load"
            >
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
      tab: null,
      dialog: false,
      enabled: true,
      filter: "",
      result: [],
      resultCount: 0,
      noDocumentsFound: false,
      timeout: 4000,
      filterError: "",
      keyValueFilters: [{ key: "", value: "", checked: true, manual: false }],
    };
  },
  methods: {
    async find() {
      const { parseFilterFromJSON, parseFilterToJSON } = useParse();
      let parsedFilter;

      if (this.tab === 1) {
        if (!this.validate()) return;
        parsedFilter = JSON.parse(this.filter);
        this.keyValueFilters = parseFilterFromJSON(parsedFilter);
      } else {
        parsedFilter = parseFilterToJSON(this.keyValueFilters);
      }

      this.result = [];
      this.noDocumentsFound = false;
      this.resultCount = 0;

      const { findDocumentsInPage, setPage, countDocuments } = useDb();

      setPage(0, this.database, this.collection);
      this.result = await findDocumentsInPage(
        this.database,
        this.collection,
        "end",
        parsedFilter
      );

      if (this.result.length > 0) {
        this.resultCount = await countDocuments(
          this.database,
          this.collection,
          parsedFilter
        );
      } else {
        this.noDocumentsFound = true;
      }

      this.filter = JSON.stringify(parsedFilter, null, 2);
    },
    async load({ done }) {
      const { findDocumentsInPage } = useDb();
      const { parseFilterToJSON } = useParse();

      const parsedFilter =
        this.tab === 1
          ? JSON.parse(this.filter)
          : parseFilterToJSON(this.keyValueFilters);

      const documents = await findDocumentsInPage(
        this.database,
        this.collection,
        "end",
        parsedFilter
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
    addItem() {
      this.keyValueFilters.push({ key: "", value: "", checked: true, manual: false });
    },
    removeItem(index) {
      if (!(index === 0 && this.keyValueFilters.length === 1)) {
        this.keyValueFilters = this.keyValueFilters
          .slice(0, index)
          .concat(this.keyValueFilters.slice(index + 1));
      } else {
        this.keyValueFilters = [{ key: "", value: "", checked: true, manual: false }];
      }
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
