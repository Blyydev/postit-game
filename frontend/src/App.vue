<script setup>
import { computed } from "vue";
import { useWebsocket } from "@/composable/useWebsocket.js";
import Logo from "@/components/parts/Logo.vue";

const { currentView, displayRoomCode, reconnect } = useWebsocket();

const headerClass = computed(() => {
  if (currentView.value && currentView.value.component.__name === "Game")
    return "small";
  else return "";
});
// <transition name="sql-fade" appear mode="out-in"></transition>
</script>

<template>
  <div class="app-content">
    <header :class="headerClass">
      <Logo />
    </header>

    <div class="party_code" v-if="displayRoomCode">{{ displayRoomCode }}</div>

    <div class="reconnect_loading" v-if="reconnect">
      <h2>CHARGEMENT</h2>
    </div>

    <component
      v-else-if="currentView"
      :is="currentView.component"
      v-bind="currentView.props"
      v-on="currentView.events"
    />
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/vars.less";

.app-content {
  width: 85%;
  max-width: 950px;
  padding-block: 1rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  transition: all 0.25s;
}

header {
  margin-bottom: 25px;
  text-align: center;

  svg {
    width: 80%;
    max-width: 250px;
    height: auto;
    fill: @white;
    color: @green;
  }

  &.small {
    margin-bottom: 15px;

    svg {
      width: 50%;
      opacity: 0.75;
    }
  }
}

.party_code {
  position: absolute;
  top: 12px;
  right: 12px;
  background: @red;
  padding: 0.25rem 0.5rem;
  border-bottom-left-radius: 5px;
  .heebo(1rem, @white);
  text-shadow: 0 0 8px darken(@red, 25%);
}
</style>
