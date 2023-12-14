<template>
  <v-layout class="mt-1">
    <HomeNavigation></HomeNavigation>

    <v-main style="height: calc(100vh - 80px)">
      <v-row class="mx-10">
        <v-col cols="12">
          <v-breadcrumbs class="pb-0">
            <template v-slot:prepend v-if="database">
              <v-icon size="small" icon="mdi-database-outline"></v-icon>
            </template>
            <v-breadcrumbs-item :to="`/home/${database}`">
              {{ database }}
            </v-breadcrumbs-item>

            <v-breadcrumbs-divider v-if="collection">
              <v-icon icon="mdi-chevron-right"></v-icon>
            </v-breadcrumbs-divider>

            <v-breadcrumbs-item v-if="collection" color="primary">
              {{ collection }}
            </v-breadcrumbs-item>
          </v-breadcrumbs>
        </v-col>

        <v-col cols="9">
          <v-card v-if="!database && !collection">
            <pre> No database selected </pre>
          </v-card>
          <v-card v-if="database && !collection"> Here </v-card>
          <v-card v-if="database && collection"> Collection </v-card>
        </v-col>
      </v-row>

      <v-container>
        <pre v-if="$route.params.slug">
          {
            database: {{ database }}
            collection: {{ collection }}
          }
        </pre>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
export default {
  setup() {
    definePageMeta({
      middleware: ["connected"],
    });
  },
  data() {
    return {
      database: this.$route.params.slug[0],
      collection: this.$route.params.slug[1],
    };
  },
};
</script>
