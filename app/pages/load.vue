<template>
  <v-container>
    <h1 class="text-center text-h5 font-weight-medium mb-3">
      Available connections
    </h1>
    <v-row>
      <v-col :cols="cols" v-for="item in items" :key="item.name">
        <v-card
          class="mx-auto ma-5"
          max-width="250"
          :elevation="10"
          rounded="lg"
        >
          <v-card-title class="text-center">{{ item.name }}</v-card-title>

          <v-divider color="secondary"></v-divider>

          <v-card-text>
            <div class="my-4"><span color="#000000">host</span>: {{ item.host }}</div>

            <div class="my-4">port: {{ item.port }}</div>

            <div class="my-4">user: {{ item.user }}</div>
          </v-card-text>

          <v-card-actions>
            <VBtnBlock color="primary"> Connect </VBtnBlock>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      cols: 4,
      items: [],
    };
  },
  methods: {
    async loadFiles() {
      const data = await $fetch("/api/saved");

      this.items = data;

      if (data.length === 1) this.cols = 12;
      else if (data.length === 2) this.cols = 6;
    },
  },
  async mounted() {
    await this.loadFiles();
  },
};
</script>
