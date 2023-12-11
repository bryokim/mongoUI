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
            type="password"
            autocomplete="new-password"
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
import { useConnect } from "@/composables/useConnect";

export default {
  data() {
    return {
      valid: false,
      connectionLoading: false,
      error: "",
      name: "",
      nameRules: [
        (value) => {
          if (value) return true;

          return "name is required";
        },
      ],
      scheme: "mongodb",
      schemeRules: [
        (value) => {
          if (value) return true;

          return "scheme is required";
        },
        (value) => {
          if (/^mongodb$/.exec(value) || /^mongodb+srv$/.exec(value))
            return true;

          return 'Invalid scheme, expected scheme to be "mongodb" or "mongodb+srv"';
        },
      ],
      host: "localhost",
      hostRules: [
        (value) => {
          if (value) return true;

          return "host is required";
        },
      ],
      port: 27017,
      portRules: [
        (value) => {
          if (value) return true;

          return "port is required";
        },
        (value) => {
          if (parseInt(value)) return true;

          return "port must be a number";
        },
      ],
      user: "",
      userRules: [
        (value) => {
          if (value) return true;

          return "user is required";
        },
      ],
      password: "",
      passwordRules: [
        (value) => {
          if (value) return true;

          return "password is required";
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
