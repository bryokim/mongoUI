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
      @submit.prevent="connect"
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
import { useConnect } from "@/composables/useConnect";

export default {
  data() {
    return {
      valid: false,
      connectionLoading: false,
      error: "",
      uri: "",
      uriRules: [
        (value) => {
          if (value) return true;

          return "uri is required";
        },
        (value) => {
          if (/^.+:\/\/.+:.+@.+:\d+.*$/.exec(value)) return true;

          return "invalid uri format";
        },
        (value) => {
          if (
            /^mongodb:\/\/.+$/.exec(value) ||
            /^mongodb+srv:\/\/.+$/.exec(value)
          )
            return true;

          return 'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"';
        },
      ],
      name: "",
      nameRules: [
        (value) => {
          if (value) return true;

          return "name is required";
        },
      ],
    };
  },
  methods: {
    async connect(values) {
      const { valid } = await values;

      if (valid) {
        this.connectionLoading = true;

        try {
          const { connect } = useConnect();
          await connect(this.name, this.uri);
          this.error = "";
        } catch (error) {
          if (error.data.message) this.error = error.data.message;
        }

        this.connectionLoading = false;

        navigateTo("/home");
      }
    },
  },
};
</script>
