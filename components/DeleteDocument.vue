<template>
  <v-dialog
    v-model="dialog"
    :scrim="false"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <VBtnBlock color="danger" prepend-icon="mdi-delete-alert" v-bind="props">
        Delete document
      </VBtnBlock>
    </template>
    <v-card>
      <v-toolbar dark color="surface" :elevation="10">
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Delete document</v-toolbar-title>
      </v-toolbar>

      <v-chip
        v-if="success"
        style="
          position: absolute;
          width: 280px;
          top: 67px;
          margin-left: auto;
          margin-right: auto;
          left: 0;
          right: 0;
        "
        color="success"
        @click:close="success = false"
        closable
      >
        Document deleted successfully
      </v-chip>

      <v-chip
        v-if="error"
        style="
          position: absolute;
          width: 500px;
          top: 67px;
          margin-left: auto;
          margin-right: auto;
          left: 0;
          right: 0;
        "
        color="danger"
        variant="flat"
        @click:close="error = ''"
        closable
      >
        {{ error }}
      </v-chip>

      <v-row>
        <v-col cols="3"></v-col>
        <v-col cols="6">
          <v-sheet class="my-10">
            <div class="mb-10">
              <p class="mb-3">Enter the filter</p>
              <client-only>
                <code-editor
                  class="mb-1"
                  v-model="filter"
                  :languages="[['json', 'JSON']]"
                  :line-nums="true"
                  theme="vs2015"
                  width="100%"
                ></code-editor>
                <v-checkbox
                  v-model="deleteMany"
                  label="deleteMany"
                  :value="true"
                  color="primary"
                ></v-checkbox>
                <div v-if="filterError" class="text-center">
                  <v-chip
                    variant="flat"
                    color="danger"
                    prepend-icon="mdi-alert-circle"
                    >{{ filterError }}</v-chip
                  >
                </div>
              </client-only>
            </div>

            <div class="mb-10">
              <p class="mb-3">Options (optional)</p>
              <client-only>
                <code-editor
                  class="mb-1"
                  v-model="options"
                  :languages="[['json', 'JSON']]"
                  :line-nums="true"
                  theme="vs2015"
                  width="100%"
                ></code-editor>
                <div v-if="optionsError" class="text-center">
                  <v-chip
                    variant="flat"
                    color="danger"
                    prepend-icon="mdi-alert-circle"
                    >{{ optionsError }}</v-chip
                  >
                </div>
              </client-only>
            </div>
            <VBtnBlock color="danger" @click="deleteDocument"
              >Delete Document(s)</VBtnBlock
            >
          </v-sheet>

          <v-sheet v-if="result" class="pa-5" :elevation="10" rounded="lg">
            <h4 class="mb-3">Delete result</h4>
            <pre><code>{{ result }}</code></pre>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import hljs from "highlight.js";
import CodeEditor from "simple-code-editor/CodeEditor";

export default {
  components: { CodeEditor },
  props: ["collection", "database"],
  emits: ["deleted"],
  data() {
    return {
      dialog: false,
      success: false,
      deleteMany: false,
      error: "",
      filter: "",
      filterError: "",
      options: "{}",
      optionsError: "",
      result: "",
    };
  },
  methods: {
    async deleteDocument() {
      if (!this.validate()) return;

      const { deleteDocument } = useDb();

      try {
        const result = await deleteDocument(
          this.database,
          this.collection,
          JSON.parse(this.filter),
          JSON.parse(this.options),
          this.deleteMany
        );
        this.error = "";
        this.result = result;
        this.success = result.acknowledged;
        this.$emit("deleted");
      } catch (error) {
        this.error = error.data.message;
      }
    },
    validate() {
      const { validateJSON, validateOptions } = useValidate();

      this.optionsError = "";
      this.filterError = "";

      const filterIsValid = validateJSON(this.filter, "filter");
      if (typeof filterIsValid === "string") {
        this.filterError = filterIsValid;
        return false;
      }

      const optionsIsValid = validateOptions(this.options);
      if (typeof optionsIsValid === "string") {
        this.optionsError = optionsIsValid;
        return false;
      }

      return true;
    },
    close() {
      this.dialog = false;
      this.success = false;
      this.error = "";
      this.result = "";
    },
  },
};
</script>
