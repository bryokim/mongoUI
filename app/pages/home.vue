<template>
  <v-layout class="mt-1">
    <v-container>
      <pre>{{ client }} </pre>
    </v-container>
  </v-layout>
</template>

<script>
import { useClientInfo } from "@/composables/useClientInfo";

export default {
  setup() {
    definePageMeta({
      middleware: ["connected"],
    });
  },
  data() {
    return {
      client: useClientInfo().value,
    };
  },
  methods: {
    check() {
      console.log(useClientInfo().value);
    },
  },
};
</script>
