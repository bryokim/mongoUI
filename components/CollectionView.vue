<template>
  <v-row class="pa-0">
    <v-col cols="12" v-if="noDocuments">
      <v-card color="warning" rounded="lg" class="py-0 mb-2"
        ><v-card-text class="pa-1 ms-4">
          <v-icon color="black">mdi-alert-circle</v-icon>
          {{ collection }} is empty. If you added documents and don't see them,
          reload page
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="6" class="pa-0">
      <v-card width="80%" class="mx-auto" :elevation="10" rounded="lg">
        <v-card-subtitle> Document Actions </v-card-subtitle>
        <v-card-text>
          <div class="mb-10">
            <InsertDocument
              v-if="canWriteDocument"
              :database="database"
              :collection="collection"
            ></InsertDocument>
          </div>
          <div class="mb-10">
            <FindDocument
              :database="database"
              :collection="collection"
            ></FindDocument>
          </div>
          <div class="mb-10">
            <UpdateDocument
              v-if="canWriteDocument"
              :database="database"
              :collection="collection"
            ></UpdateDocument>
          </div>

          <DeleteDocument
            v-if="canWriteDocument"
            :database="database"
            :collection="collection"
          ></DeleteDocument>
        </v-card-text>
      </v-card>

      <v-sheet class="mt-5 mx-auto" max-width="80%" :elevation="4" rounded="lg">
        <v-list lines="two" rounded="lg">
          <v-list-item inset class="text-h6 pt-0">
            <template v-slot:prepend>
              <v-icon color="white">mdi-information-variant</v-icon>
            </template>
            Collection Stats
          </v-list-item>

          <v-divider color="success" thickness="2px"></v-divider>

          <v-list-item title="document count" :subtitle="documentCount">
            <template v-slot:prepend>
              <v-icon color="white">mdi-file-document-multiple</v-icon>
            </template>
          </v-list-item>

          <!-- <v-list-item title="size" subtitle="200 Mb">
            <template v-slot:prepend>
              <v-icon color="white">mdi-file-document-multiple</v-icon>
            </template>
          </v-list-item> -->
        </v-list>
      </v-sheet>
    </v-col>

    <v-col cols="6" class="pa-0">
      <v-sheet class="pa-2">
        <div v-if="canDropCollection">
          <div>
            <p
              v-if="dropCollectionError"
              class="mb-3 text-center text-danger rounded"
            >
              {{ dropCollectionError }}
            </p>
          </div>
          <v-sheet width="400px" class="mx-auto" :elevation="10">
            <v-dialog
              v-model="dropCollectionDialog"
              max-width="500px"
              transition="dialog-top-transition"
            >
              <template v-slot:activator="{ props }">
                <VBtnBlock
                  v-bind="props"
                  class="mb-10"
                  color="#F5516E"
                  width="100px"
                  prepend-icon="mdi-delete-alert"
                  >Drop Collection</VBtnBlock
                >
              </template>

              <v-card rounded="lg" theme="dark">
                <v-card-text>
                  <v-icon size="large" color="danger" class="me-2">
                    mdi-delete-alert
                  </v-icon>
                  Are you sure you want to drop {{ collection }}?
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text="cancel" @click="closeDialog"></v-btn>
                  <v-btn
                    text="drop"
                    color="danger"
                    @click="dropCollection"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-sheet>
        </div>

        <p class="mb-4 text-subtitle-2">Example document in the collection</p>
        <ClientOnly>
          <CodeEditor
            v-model="documentString"
            :languages="[['json', 'JSON']]"
            theme="vs2015"
            width="100%"
            height="400px"
            :read-only="true"
            :wrap="true"
          ></CodeEditor>
        </ClientOnly>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import hljs from "highlight.js";
import CodeEditor from "simple-code-editor/CodeEditor";

export default {
  components: {
    CodeEditor,
  },
  props: ["collection", "database"],
  data() {
    return {
      noDocuments: false,
      documentCount: 0,
      document: {},
      documentString: "{}",
      dropCollectionDialog: false,
      dropCollectionError: "",
    };
  },
  computed: {
    canWriteDocument() {
      return (
        useRolesInfo().value.superuser ||
        useRolesInfo().value.writeDocument?.includes(this.database)
      );
    },
    canDropCollection() {
      return (
        useRolesInfo().value.superuser ||
        useRolesInfo().value.collections?.includes(this.database)
      );
    },
  },
  methods: {
    async getDocumentCount() {
      const { countDocuments } = useDb();

      this.documentCount = await countDocuments(this.database, this.collection);
    },

    async findSingleDocument() {
      const { findDocuments } = useDb();

      this.document = await findDocuments(
        this.database,
        this.collection,
        false
      );
    },
    async dropCollection() {
      const { dropCollection } = useDb();

      try {
        await dropCollection(this.database, this.collection);

        this.$router.push(`/home/${this.database}`);
      } catch (error) {
        console.log(error.data.message);
        this.dropCollectionError = error.data.message;
      }

      this.closeDialog();
    },
    closeDialog() {
      this.dropCollectionDialog = false;
    },
  },
  async mounted() {
    await this.getDocumentCount();
    this.noDocuments = this.documentCount === 0 ? true : false;

    await this.findSingleDocument();
    this.documentString = this.document
      ? JSON.stringify(this.document, null, 2)
      : "no document found";
  },
};
</script>
