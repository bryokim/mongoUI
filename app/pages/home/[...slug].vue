<template>
  <v-layout class="mt-1">
    <DatabaseNavigation></DatabaseNavigation>

    <v-main style="height: calc(100vh - 80px)">
      <v-container>
        <pre v-if="$route.params.slug">
          {
            database: {{ $route.params.slug[0] }}
            collection: {{ $route.params.slug[1] }}
          }
        </pre
        >
        <pre v-else> No collection selected </pre>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
export default {
  setup() {
    definePageMeta({
      middleware: ["connected"],
    });
  },
};
</script>
