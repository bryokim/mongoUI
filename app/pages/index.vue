<template>
  <v-container>
    <v-sheet
      class="align-center justify-center flex-wrap text-center mx-auto pa-4"
      :max-width="1000"
      width="100%"
    >
      <div class="mb-16">
        <h2 class="text-h4 font-weight-medium">
          Welcome to <span class="name">MongoUI</span>.
        </h2>
      </div>

      <v-sheet class="mx-auto" width="30%">
        <div class="mb-16">
          <VBtnBlock color="success">Create new connection</VBtnBlock>
        </div>
        <div class="mb-16">
          <VBtnBlock color="primary-2">Load saved connection</VBtnBlock>
        </div>
        <div class="mb-16">
          <VBtnBlock color="purple-2">Settings</VBtnBlock>
        </div>
      </v-sheet>
    </v-sheet>
  </v-container>
</template>

<style>
.name {
  color: #91fd94;
  font-family: Antic Slab, sans-serif;
  font-size: 40px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
</style>
