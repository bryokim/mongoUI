<template>
  <v-app>
    <NavBar></NavBar>
    <v-main>
      <slot />
    </v-main>
    <v-sheet location="bottom right" position="absolute" class="mb-7 me-4">
      <v-btn
        icon
        variant="elevated"
        rounded="rounded-circle"
        color="secondary"
        @click="openDocumentation"
        style="z-index: 1000;"
      >
        <v-icon>mdi-help</v-icon>
      </v-btn>
    </v-sheet>
  </v-app>
</template>

<script>
export default {
  methods: {
    openDocumentation() {
      navigateTo("/documentation", {
        open: {
          target: "_blank",
        },
      });
    },
  },
};
</script>
