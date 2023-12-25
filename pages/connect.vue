<template>
  <v-container>
    <v-sheet
      class="align-center justify-center flex-wrap text-center mx-auto pa-4"
      :max-width="1000"
      width="100%"
    >
      <v-tabs v-model="tab" fixed-tabs color="#FF9D87" class="mb-16">
        <v-tab :value="1" class="text-lowercase"> Connect with URI </v-tab>
        <v-tab :value="2" class="text-lowercase">
          Connect with custom values
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item :value="1">
          <UriConnectForm></UriConnectForm>
        </v-window-item>

        <v-window-item :value="2">
          <CustomConnectForm></CustomConnectForm>
        </v-window-item>
      </v-window>
    </v-sheet>
  </v-container>
</template>

<script>
export default {
  setup() {
    definePageMeta({
      middleware: ["disconnected"],
    });
  },
  data: () => ({
    tab: null,
  }),
};
</script>
