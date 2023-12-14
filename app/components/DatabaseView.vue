<template>
  <v-row v-if="validDatabase()">
    <v-col cols="6">
      <v-card
        elevation="10"
        class="mb-10 overflow-y-auto mx-auto"
        rounded="lg"
        max-width="400px"
        max-height="600px"
      >
        <v-card-text class="pt-0">
          <v-list nav>
            <v-list-item inset class="text-h6">
              <template v-slot:append>
                <v-icon color="white" size="small"
                  >mdi-plus-circle-outline</v-icon
                >
              </template>
              Collections
            </v-list-item>

            <v-divider color="success" thickness="2px"></v-divider>

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
      <v-card rounded="lg" class="mb-14">
        <v-card-subtitle> Database Actions </v-card-subtitle>
        <v-card-text>
          <div>
            <VBtnBlock
              class="mb-6"
              color="#F5516E"
              prepend-icon="mdi-delete-alert"
              >Drop Database</VBtnBlock
            >
          </div>
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

        <v-list-item title="roles" :subtitle="roles.toString() || 'None'">
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
      max-width="400px"
      type="warning"
      title="Database missing"
      :text="`${database} not found`"
      rounded="lg"
      class="mx-auto mb-16"
    ></v-alert>

    <v-card max-width="400px" rounded="lg" elevation="4" class="mx-auto">
      <v-card-subtitle class="mt-4">create {{ database }}</v-card-subtitle>
      <v-card-text>
        <v-form>
          <v-text-field
            variant="underlined"
            label="Database"
            :model-value="database"
          >
          </v-text-field>
          <v-text-field variant="underlined" label="Collection"> </v-text-field>

          <v-card-actions>
            <VBtnBlock color="primary" variant="elevated" class="my-3">
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
      dbsInfo: useDbsInfo().value,
      clientInfo: useClientInfo().value,
    };
  },
  computed: {
    collections() {
      return useDbsInfo().value?.filter(
        (dbInfo) => dbInfo.name === this.database
      )[0].collections;
    },
    roles() {
      return useDbsInfo().value?.filter(
        (dbInfo) => dbInfo.name === this.database
      )[0].roles;
    },
  },
  methods: {
    validDatabase() {
      return useDbsInfo().value?.some(
        (dbInfo) => dbInfo.name === this.database
      );
    },
  },
};
</script>
