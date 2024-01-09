<template>
  <v-sheet width="400" class="mx-auto">
    <div>
      <p v-if="error" class="mb-3 text-center">
        {{ error }}
      </p>
    </div>

    <v-form
      v-model="valid"
      validate-on="submit"
      fast-fail
      @submit.prevent="connectDb"
    >
      <v-card color="#3578AF" rounded="lg" class="mb-16">
        <v-container>
          <VTextFieldConnect
            v-model="name"
            :rules="nameRules"
            label="name"
            hint="Name given to the connection instance"
          >
          </VTextFieldConnect>

          <VTextFieldConnect
            v-model="scheme"
            :rules="schemeRules"
            label="scheme"
            hint="mongodb or mongodb+srv"
          ></VTextFieldConnect>

          <VTextFieldConnect
            v-model="host"
            :rules="hostRules"
            label="host"
          ></VTextFieldConnect>

          <VTextFieldConnect
            v-model="port"
            :rules="portRules"
            label="port"
          ></VTextFieldConnect>

          <VTextFieldConnect
            v-model="user"
            :rules="userRules"
            label="user"
            autocomplete="username"
          ></VTextFieldConnect>

          <VTextFieldConnect
            v-model="password"
            :rules="passwordRules"
            label="password"
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="show = !show"
          ></VTextFieldConnect>
        </v-container>
      </v-card>

      <div class="text-center">
        <VBtnBlock
          :loading="connectionLoading"
          color="#00FFFF"
          type="submit"
          variant="flat"
        >
          Connect
        </VBtnBlock>
      </div>
    </v-form>
  </v-sheet>
</template>

<script>
import { useConnect } from "~/composables/useConnect";
import { useValidate } from "~/composables/useValidate";

export default {
  data() {
    return {
      show:false,
      valid: false,
      connectionLoading: false,
      error: "",
      name: "",
      nameRules: [
        async (value) => {
          const valid = await useValidate().validateName(value);

          return valid;
        },
      ],
      scheme: "mongodb",
      schemeRules: [
        (value) => {
          const valid = useValidate().validateScheme(value);

          return valid;
        },
      ],
      host: "localhost",
      hostRules: [
        (value) => {
          const valid = useValidate().validateHost(value);

          return valid;
        },
      ],
      port: 27017,
      portRules: [
        (value) => {
          const valid = useValidate().validatePort(value);

          return valid;
        },
      ],
      user: "",
      userRules: [
        (value) => {
          const valid = useValidate().validateUser(value);

          return valid;
        },
      ],
      password: "",
      passwordRules: [
        (value) => {
          const valid = useValidate().validatePassword(value);

          return valid;
        },
      ],
    };
  },

  methods: {
    async connectDb(values) {
      const { valid } = await values;

      if (valid) {
        this.connectionLoading = true;

        const encodedUser = encodeURIComponent(this.user);
        const encodedPassword = encodeURIComponent(this.password);

        const uri = `${this.scheme}://${encodedUser}:${encodedPassword}@${this.host}:${this.port}`;

        try {
          const { connect } = useConnect();
          await connect(this.name, uri);
          this.error = "";
          navigateTo("/home");
        } catch (error) {
          if (error.data.message) this.error = error.data.message;
        }

        this.connectionLoading = false;
      }
    },
  },
};
</script>
