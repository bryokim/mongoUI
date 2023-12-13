<template>
  <v-dialog v-model="dialog" max-width="400px">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="plain">
        <v-tooltip activator="parent" location="top" text="connect">
        </v-tooltip>
        <v-icon size="small"> mdi-connection </v-icon>
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-text>
        <div class="text-center mb-5">
          <v-row>
            <v-col cols="10"> Please enter your password </v-col>
            <v-col><v-icon @click="close" size="large">mdi-close</v-icon></v-col>
          </v-row>
        </div>

        <div>
          <p v-if="error" class="mb-3 text-center bg-danger rounded">
            {{ error }}
          </p>
        </div>

        <v-form
          v-model="valid"
          validate-on="submit"
          fast-fail
        >
          <v-text-field
            variant="underlined"
            v-model="item.host"
            label="host"
            readonly
          ></v-text-field>
          <v-text-field
            variant="underlined"
            v-model="item.port"
            label="port"
            readonly
          ></v-text-field>
          <v-text-field
            variant="underlined"
            v-model="item.user"
            label="user"
            readonly
          ></v-text-field>
          <v-text-field
            variant="underlined"
            v-model="password"
            label="password"
            :rules="[rules.isValid]"
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            @click:append="show = !show"
          ></v-text-field>

          <VBtnBlock color="primary" type="submit" class="mt-5"
            >Connect</VBtnBlock
          >
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
      error: "",
      password: "",
      show: false,
      rules: {
        isValid: async (value) =>
          await useValidate().validatePassword(value, this.item.name),
      },
    };
  },
  props: ["item"],
  methods: {
    close() {
      this.dialog = false;
    },
  },
};
</script>
