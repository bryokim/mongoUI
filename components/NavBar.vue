<template>
  <v-toolbar id="navbar" :elevation="8">
    <NuxtLink to="/home">
      <v-toolbar-title class="ms-4">
        <img src="~/assets/images/logo.svg" alt="mongoUI" width="280" />
      </v-toolbar-title>
    </NuxtLink>
    <v-spacer></v-spacer>

    <div class="me-4">
      <!-- <div v-if="!useClientInfo().value">MongoDB version X.X.X</div> -->
      <div v-if="useClientInfo().value">
        <VBtnBlock color="danger" @click="disconnect"
          >Close connection</VBtnBlock
        >
      </div>
    </div>
  </v-toolbar>
</template>

<script>
import { useConnect } from "@/composables/useConnect";
import { useClientInfo } from "@/composables/useClientInfo";

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
.title {
  color: #91fd94;
  font-family: "Montserrat Alternates", sans-serif;
  font-size: 48px;
  line-height: normal;
  margin-left: 50px;
}
</style>
