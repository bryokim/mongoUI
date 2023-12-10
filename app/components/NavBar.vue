<template>
  <v-toolbar id="navbar" :elevation="8">
    <v-toolbar-title class="title">MongoUI</v-toolbar-title>
    <v-spacer></v-spacer>

    <div class="me-4">
        MongoDB version X.X.X
    </div>
  </v-toolbar>
</template>

<style>
#navbar {
  background: #316a99;
  height: 75px;
}
#navbar .title {
  color: #91fd94;
  font-family: Antic Slab, sans-serif;
  font-size: 48px;
  line-height: normal;
  margin-left: 50px;
}
</style>
