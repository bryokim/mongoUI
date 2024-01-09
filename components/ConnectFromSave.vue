<template>
  <v-dialog v-model="dialog" max-width="400px">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="plain">
        <v-tooltip activator="parent" location="top" text="connect">
        </v-tooltip>
        <v-icon size="small" color="success"> mdi-connection </v-icon>
      </v-btn>
    </template>

    <v-card rounded="lg" theme="dark">
      <v-card-text>
        <div class="text-center mb-5">Please enter your password</div>

        <div>
          <p v-if="error" class="mb-3 text-center text-danger rounded">
            {{ error }}
          </p>
        </div>

        <v-form
          v-model="valid"
          validate-on="submit"
          @submit.prevent="connectDb"
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
            :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            @click:append-inner="show = !show"
            focused
          ></v-text-field>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text="cancel" @click="close"></v-btn>
            <v-btn
              text="connect"
              color="success"
              type="submit"
              :loading="loading"
              :disabled="!password"
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
      loading: false,
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
    async connectDb(values) {
      const { valid } = await values;

      if (valid && !this.loading) {
        this.loading = true;
        try {
          const { reconnect } = useConnect();
          await reconnect(this.item.name, this.password);
          this.error = "";
          navigateTo("/home");
        } catch (error) {
          if (error.data.message) this.error = error.data.message;
        }
        this.loading = false;
      }
    },
    close() {
      this.password = "";
      this.dialog = false;
      this.show = false;
    },
  },
};
</script>
