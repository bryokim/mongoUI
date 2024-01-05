<template>
  <v-sheet
    width="80%"
    min-height="60px"
    class="mx-auto pa-4"
    rounded="lg"
    color="background"
  >
    <v-row>
      <v-col cols="3">
        <NuxtLink to="/documentation">
          <img src="~/assets/images/logo.svg" alt="mongoUI" :width="280" />
        </NuxtLink>
      </v-col>

      <v-col cols="8" class="text-end">
        <nav>
          <ContentNavigation v-slot="{ navigation }">
            <NuxtLink
              v-for="link of navigation"
              :key="link._path"
              :to="link.children ? '' : link._path"
              class="text-decoration-none text-primary"
              active-class="text-success"
            >
              <v-menu
                v-if="link.children"
                open-delay="100"
                offset="5"
                open-on-hover
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    variant="text"
                    class="text-lowercase"
                    v-bind="props"
                    append-icon="mdi-chevron-down"
                  >
                    {{ link.title }}
                  </v-btn>
                </template>
                <v-list
                  density="compact"
                  elevation="3"
                  rounded="lg"
                  class="bg-black pa-2"
                  color="primary"
                >
                  <v-list-item
                    v-for="(child, index) in link.children"
                    :key="index"
                    :value="index"
                    :to="child._path"
                    class="v-card--hover"
                    rounded="lg"
                    slim
                  >
                    <v-list-item-title>{{ child.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-btn v-else variant="text" class="text-lowercase">
                {{ link.title }}
              </v-btn>
            </NuxtLink>
          </ContentNavigation>
        </nav>
      </v-col>

      <v-col cols="1">
        <v-btn
          @click="
            $colorMode.preference =
              $colorMode.preference === 'dark' ? 'light' : 'dark'
          "
          variant="plain"
          flat
        >
          <Icon name="ph:sun" size="18px" v-if="$colorMode.preference === 'light'" />
          <Icon name="ph:moon" size="18px" v-else />
        </v-btn>
      </v-col>
    </v-row>
  </v-sheet>
</template>