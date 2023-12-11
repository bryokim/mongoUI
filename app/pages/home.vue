<template>
  <v-layout class="mt-1">
    <v-container>
      <pre>{{ client }} </pre>
    </v-container>
  </v-layout>
</template>

<script>
import { useClient } from "@/composables/useClient";

export default {
  data() {
    return {
      client: useClient().value,
    };
  },
  methods: {
    check() {
      console.log(useClient().value);
    },
  },
};
</script>
