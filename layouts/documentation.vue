<template>
  <v-app :theme="$colorMode.preference === 'light' ? 'light' : 'dark'">
    <AppNavbar></AppNavbar>
    <v-main class="mb-10">
      <v-sheet
        max-width="800px"
        class="mx-auto pa-5 mt-10"
        rounded="lg"
        color="background"
      >
        <slot />
      </v-sheet>
    </v-main>
  </v-app>
</template>
