<template>
  <v-dialog v-model="dialog" max-width="400px" persistent>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="plain">
        <v-tooltip activator="parent" location="top" text="delete"> </v-tooltip>
        <v-icon color="red"> mdi-delete </v-icon>
      </v-btn>
    </template>

    <v-card rounded="lg" theme="dark">
      <v-card-text>
        Are you sure you want to delete '{{ item.name }}'?
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Cancel" @click="close"></v-btn>
        <v-btn text="Delete" color="red" @click="deleteItem"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    };
  },
  props: ["item"],
  emits: ["deleted"],
  methods: {
    async deleteItem() {
      await $fetch("/api/client/delete", {
        method: "POST",
        body: { name: this.item.name },
      });

      this.dialog = false;
      this.$emit("deleted");
    },
    close() {
      this.dialog = false;
    },
  },
};
</script>
