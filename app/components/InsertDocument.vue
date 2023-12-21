<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <VBtnBlock color="primary" v-bind="props"> Insert document </VBtnBlock>
    </template>
    <v-card>
      <v-toolbar dark color="surface" :elevation="10">
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Insert document</v-toolbar-title>
      </v-toolbar>

      <v-row>
        <v-col cols="3"></v-col>
        <v-col cols="6">
          <v-sheet>
            <div class="my-10">
              Inserting into
              <v-chip color="secondary" variant="flat">{{ collection }}</v-chip>
              collection in the
              <v-chip color="primary" variant="flat">{{ database }}</v-chip>
              database.
            </div>

            <p class="mb-5">
              Enter your document below. Can be a single document or array of
              documents
            </p>

            <div class="mb-10">
              <ClientOnly>
                <CodeEditor
                  class="mb-1"
                  v-model="newDocument"
                  :languages="[['json', 'JSON']]"
                  :line-nums="true"
                  theme="vs2015"
                  width="100%"
                >
                </CodeEditor>
              </ClientOnly>
              <div v-if="error" class="text-center">
                <v-chip
                  variant="flat"
                  color="danger"
                  prepend-icon="mdi-alert-circle"
                  >{{ error }}</v-chip
                >
              </div>
            </div>

            <VBtnBlock color="success" @click="insert"
              >Insert Document(s)</VBtnBlock
            >
          </v-sheet>

          <v-sheet
            v-if="result"
            class="mt-16 pa-5"
            :elevation="10"
            rounded="lg"
          >
            <h4 class="mb-3">Insertion result</h4>
            <pre><code>{{ result }}</code></pre>
          </v-sheet>
        </v-col>

        <v-snackbar
          v-model="insertedSuccessfully"
          color="success"
          :timeout="timeout"
          :elevation="24"
          :timer="true"
          variant="outlined"
          location="top right"
          rounded="lg"
          class="mt-16"
        >
          Document inserted successfully

          <template v-slot:actions>
            <v-btn
              color="danger"
              variant="text"
              @click="insertedSuccessfully = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>

        <v-snackbar
          v-model="insertedUnsuccessfully"
          color="error"
          :elevation="24"
          variant="flat"
          location="top right"
          rounded="lg"
          class="mt-16"
        >
          Error while inserting document

          <template v-slot:actions>
            <v-btn
              color="white"
              variant="text"
              @click="insertedUnsuccessfully = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
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
  emits: ["inserted"],
  components: {
    CodeEditor,
    JsonViewer,
  },
  data() {
    return {
      dialog: false,
      valid: false,
      newDocument: "",
      rules: {
        validateDocument: (value) => {
          return useValidate().validateJSON(value, "document");
        },
      },
      result: "",
      timeout: 4000,
      insertedSuccessfully: false,
      insertedUnsuccessfully: false,
      error: "",
    };
  },
  methods: {
    async insert() {
      if (!this.validate()) return;

      const { insertDocument } = useDb();

      const isEmpty = useDbsInfo().value.empty?.some(
        (db) => db.name === this.database
      );

      let result;
      try {
        result = await insertDocument(
          this.database,
          this.collection,
          JSON.parse(this.newDocument)
        );
        this.insertedSuccessfully = true;
        this.insertedUnsuccessfully = false;
        this.$emit("inserted");
      } catch (error) {
        result = error.message;
        this.insertedUnsuccessfully = true;
      }

      this.result = result;

      if (isEmpty) {
        await this.$router.push(`/home/${this.database}`);
      }
    },
    validate() {
      const { validateJSON } = useValidate();

      this.error = "";

      const documentIsValid = validateJSON(this.newDocument, "document");
      if (typeof documentIsValid === "string") {
        this.error = documentIsValid;
        return false;
      }

      return true;
    },
    close() {
      this.dialog = false;
      this.insertedSuccessfully = false;
      this.insertedUnsuccessfully = false;
      this.result = "";
    },
  },
};
</script>
