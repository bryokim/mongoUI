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

      <v-chip
        style="
          position: absolute;
          width: 280px;
          top: 67px;
          margin-left: auto;
          margin-right: auto;
          left: 0;
          right: 0;
        "
        v-if="insertedSuccessfully"
        color="success"
        closable
        @click:close="insertedSuccessfully = false"
      >
        Document inserted successfully
      </v-chip>

      <v-chip
        style="
          position: absolute;
          width: 280px;
          top: 67px;
          margin-left: auto;
          margin-right: auto;
          left: 0;
          right: 0;
        "
        color="error"
        variant="flat"
        v-if="insertedUnsuccessfully"
        closable
        @click:close="insertedUnsuccessfully = false"
      >
        Error while inserting document
      </v-chip>

      <v-row>
        <v-col cols="6">
          <v-sheet class="ms-16">
            <v-card-text>
              <div>
                Inserting into
                <v-chip color="secondary" variant="outlined">{{
                  collection
                }}</v-chip>
                collection in the
                <v-chip color="primary" variant="outlined">{{
                  database
                }}</v-chip>
                database.
              </div>
              <v-form
                ref="form"
                v-model="valid"
                class="mt-10"
                @submit.prevent="insert"
                fast-fail
              >
                <p class="mb-5">
                  Enter your document below. Can be a single document or array
                  of documents
                </p>
                <v-textarea
                  v-model="newDocument"
                  variant="outlined"
                  bg-color="#1B1E2C"
                  rounded="lg"
                  spellcheck="false"
                  :rules="[rules.validateDocument]"
                  @update:focused="onBlur"
                  auto-grow
                  clearable
                ></v-textarea>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <VBtnBlock color="success" type="submit"
                    >Insert Document(s)</VBtnBlock
                  >
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-sheet>

          <v-sheet
            v-if="result"
            class="ms-16 pa-5"
            :elevation="10"
            rounded="lg"
          >
            <h4 class="mb-3">Insertion result</h4>
            <pre><code>{{ result }}</code></pre>
          </v-sheet>
        </v-col>

        <v-spacer></v-spacer>

        <v-col cols="4" class="me-10">
          <v-container>
            <v-expansion-panels variant="popout">
              <v-expansion-panel rounded="lg">
                <v-expansion-panel-title>
                  Collection Schema
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <JsonViewer
                    :value="collectionSchema"
                    theme="my-theme"
                  ></JsonViewer>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel rounded="lg">
                <v-expansion-panel-title>
                  Example Inputs
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div>
                    <v-sheet class="pa-2 mb-3" rounded="lg" :elevation="10">
                      <p class="mb-5">Single Document:</p>
                      <pre><code>{{ exampleDocument }}</code></pre>
                    </v-sheet>
                    <v-sheet class="pa-2" rounded="lg" :elevation="10">
                      <p class="mb-5">Multiple Documents in array:</p>
                      <pre><code>{{ exampleDocuments }}</code></pre>
                    </v-sheet>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
import JsonViewer from "vue-json-viewer/ssr";

export default {
  props: ["database", "collection"],
  emits: ["inserted"],
  components: {
    JsonViewer,
  },
  data() {
    return {
      dialog: false,
      valid: false,
      newDocument: "",
      rules: {
        validateDocument: (value) => {
          return useValidate().validateDocument(value);
        },
      },
      result: "",
      insertedSuccessfully: false,
      insertedUnsuccessfully: false,
      collectionSchema: "",
      exampleDocument: {
        name: "One",
        age: 23,
        location: "Here",
        phone: 986038224,
      },
      exampleDocuments: [
        {
          name: "One",
          age: 23,
          location: "Here",
          phone: 986038224,
        },
        {
          name: "Two",
          age: 21,
          location: "There",
          phone: 967038224,
        },
      ],
    };
  },
  methods: {
    async insert(values) {
      const { valid } = await values;

      if (valid) {
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
        } catch (error) {
          result = error.message;
          this.insertedUnsuccessfully = true;
        }

        this.result = result;
        this.$refs.form.reset();
        this.$emit("inserted");

        if (isEmpty) {
          await this.$router.push(`/home/${this.database}`);
        }
      }
    },
    onBlur() {
      this.$refs.form.resetValidation();
    },
    close() {
      this.dialog = false;
      this.insertedSuccessfully = false;
      this.insertedUnsuccessfully = false;
      this.result = "";
    },
    async schema() {
      const { getSchema } = useDb();

      const result = await getSchema(this.database, this.collection);

      this.collectionSchema = result;
    },
  },
  async mounted() {
    await this.schema();
  },
};
</script>
