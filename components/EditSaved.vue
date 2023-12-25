<template>
  <v-dialog v-model="dialog" max-width="400px" persistent>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="plain">
        <v-tooltip activator="parent" location="top" text="edit"> </v-tooltip>
        <v-icon color="primary"> mdi-pencil </v-icon>
      </v-btn>
    </template>

    <v-card rounded="lg" theme="dark">
      <v-card-title class="text-center"> Editing {{ item.name }} </v-card-title>
      <v-card-text>
        <v-form v-model="valid" @submit.prevent="updateItem">
          <v-text-field
            label="name"
            variant="underlined"
            v-model="newItem.name"
            :rules="[rules.name]"
          >
          </v-text-field>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text="Cancel" @click="close"></v-btn>
            <v-btn
              text="Update"
              color="primary"
              type="submit"
              :disabled="!valid || newItem.name === item.name"
            ></v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      valid: false,
      newItem: {
        name: this.item.name,
      },
      defaultItem: {
        name: this.item.name,
      },
      rules: {
        name: async (value) => {
          if (value === this.item.name) return true;
          const isValid = await useValidate().validateName(value);
          return isValid;
        },
      },
    };
  },
  props: ["item"],
  emits: ["updated"],
  methods: {
    async updateItem() {
      await $fetch("/api/client/update", {
        method: "POST",
        body: { name: this.item.name, newClientInfo: this.newItem },
      });

      this.dialog = false;
      this.newItem = this.defaultItem;
      this.$emit("updated");
    },
    close() {
      this.newItem = this.defaultItem;
      this.dialog = false;
    },
  },
};
</script>
