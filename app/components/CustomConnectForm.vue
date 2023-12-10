<template>
    <v-sheet width="400" class="mx-auto">
      <v-form
        v-model="valid"
        validate-on="submit"
        fast-fail
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
              v-model="protocol"
              :rules="protocolRules"
              label="protocol"
              hint="Eg. mongodb, mongodb+srv"
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
  export default {
    data() {
      return {
        valid: false,
        connectionLoading: false,
        name: "",
        nameRules: [
          (value) => {
            if (value) return true;
  
            return "name is required";
          },
        ],
        protocol: "mongodb",
        protocolRules: [
          (value) => {
            if (value) return true;
  
            return "protocol is required";
          },
        ],
        host: "localhost",
        hostRules: [
          (value) => {
            if (value) return true;
  
            return "host is required";
          },
        ],
        port: 127017,
        portRules: [
          (value) => {
            if (value) return true;
  
            return "port is required";
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
  };
  </script>
  