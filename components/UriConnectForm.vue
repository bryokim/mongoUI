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
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="name"
            variant="underlined"
            hint="Name given to the connection instance"
            required
          >
          </v-text-field>

          <v-text-field
            v-model="uri"
            :rules="uriRules"
            label="uri"
            variant="underlined"
            placeholder="mongodb://root:1234@localhost:127017"
            hint="protocol://user:pass@host:port"
            required
          >
          </v-text-field>
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
      valid: false,
      connectionLoading: false,
      error: "",
      uri: "",
      uriRules: [
        (value) => {
          const valid = useValidate().validateUri(value);

          return valid;
        },
      ],
      name: "",
      nameRules: [
        async (value) => {
          const valid = await useValidate().validateName(value);

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

        try {
          const { connect } = useConnect();
          await connect(this.name, this.uri);
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
