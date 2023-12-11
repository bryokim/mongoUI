<template>
  <v-toolbar id="navbar" :elevation="8">
    <v-toolbar-title class="title">MongoUI</v-toolbar-title>
    <v-spacer></v-spacer>

    <div class="me-4">
      <div v-if="!useClient().value">MongoDB version X.X.X</div>
      <div v-else>
        <VBtnBlock color="danger" @click="disconnect"
          >Close connection</VBtnBlock
        >
      </div>
    </div>
  </v-toolbar>
</template>

<script>
import { useConnect } from "@/composables/useConnect";
import { useClient } from "@/composables/useClient";

export default {
  methods: {
    async disconnect() {
      const { disconnect } = useConnect();

      await disconnect();

      navigateTo("/");
    },
  },
};
</script>

<style>
#navbar {
  background: #316a99;
  height: 75px;
}
#navbar .title {
  color: #91fd94;
  font-family: Antic Slab, sans-serif;
  font-size: 48px;
  line-height: normal;
  margin-left: 50px;
}
</style>
