<template>
  <v-dialog
    v-model="dialog"
    :scrim="false"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <VBtnBlock color="purple-2" v-bind="props" prepend-icon="mdi-file-edit">
        Update document
      </VBtnBlock>
    </template>
    <v-card>
      <v-toolbar dark color="surface" :elevation="10">
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Update document</v-toolbar-title>
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
        Document updated successfully
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
              <p class="mb-3">Enter the update</p>

              <client-only>
                <code-editor
                  class="mb-1"
                  v-model="update"
                  :languages="[['json', 'JSON']]"
                  :line-nums="true"
                  theme="vs2015"
                  width="100%"
                  @textarea="focus"
                  @update:focus="console.log('Done')"
                ></code-editor>
                <v-checkbox
                  v-model="updateMany"
                  label="updateMany"
                  :value="true"
                  color="primary"
                ></v-checkbox>
                <div v-if="updateError" class="text-center">
                  <v-chip
                    variant="flat"
                    color="danger"
                    prepend-icon="mdi-alert-circle"
                    >{{ updateError }}</v-chip
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
            <VBtnBlock color="success" @click="updateDocument"
              >Update Document(s)</VBtnBlock
            >
          </v-sheet>

          <v-sheet v-if="result" class="pa-5" :elevation="10" rounded="lg">
            <h4 class="mb-3">Update result</h4>
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
  components: {
    CodeEditor,
  },
  props: ["database", "collection"],
  emits: ["updated"],
  data() {
    return {
      dialog: false,
      valid: false,
      update: "",
      options: "{}",
      filter: "",
      filterError: "",
      updateError: "",
      optionsError: "",
      result: "",
      error: "",
      success: false,
      updateMany: false,
    };
  },
  methods: {
    async updateDocument() {
      if (!this.validate()) return;
      const { updateDocument } = useDb();

      let result;
      try {
        result = await updateDocument(
          this.database,
          this.collection,
          JSON.parse(this.filter),
          JSON.parse(this.update),
          JSON.parse(this.options),
          this.updateMany
        );
        this.error = "";
        this.result = result;
        this.success = result.acknowledged;
        this.$emit("updated");
      } catch (error) {
        this.error = error.data.message;
      }
    },
    validate() {
      const { validateJSON, validateOptions } = useValidate();

      this.updateError = "";
      this.optionsError = "";
      this.filterError = "";

      const filterIsValid = validateJSON(this.filter, "filter");
      if (typeof filterIsValid === "string") {
        this.filterError = filterIsValid;
        return false;
      }

      const updateIsValid = validateJSON(this.update, "update");
      if (typeof updateIsValid === "string") {
        this.updateError = updateIsValid;
        return false;
      }

      const optionsIsValid = validateOptions(this.options);
      if (typeof optionsIsValid === "string") {
        this.optionsError = optionsIsValid;
        return false;
      }

      return true;
    },
    onBlur() {
      this.$refs.form.resetValidation();
    },
    close() {
      this.dialog = false;
    },
    focus(node) {
      node.focus();
      console.log(node);
    },
  },
};
</script>
