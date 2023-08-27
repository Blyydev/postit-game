<script setup>
import { computed, ref, watch } from "vue";

import PostitItem from "@/components/parts/PostitItem.vue";

const props = defineProps(["socket", "players", "visitor"]);

const playersCopy = ref(props.players);

const quitGame = () => {
  if (confirm("Voulez-vous vraiment quitter la partie ?")) {
    props.socket.emit("quitGame", true);
    emit("backHome");
  }
};

const postItFound = () => {
  if (confirm(`Voulez-vous changer le post-it de ${targetPseudo.value} ?`)) {
    emit("changePostit");
  }
};

const targetPseudo = computed(() => {
  for (const key in playersCopy.value) {
    if (props.players[key].postit_author === props.socket.id)
      return props.players[key].pseudo;
  }
  return null;
});

const isManyPostit = computed(() => {
  return Object.values(playersCopy.value).length > 5;
});

const emit = defineEmits(["backHome", "changePostit"]);

watch(
  () => props.players,
  (newPlayers) => {
    playersCopy.value = newPlayers;
  }
);
</script>

<template>
  <div class="postit_list" :class="{ many_items: isManyPostit }">
    <PostitItem
      v-for="(player, playerID) in playersCopy"
      :key="playerID"
      :postit="player"
      :by="players[player.postit_author]?.pseudo"
      :isMe="playerID === props.socket.id"
    />
  </div>

  <template v-if="!visitor">
    <button @click.prevent="postItFound">
      <strong>{{ targetPseudo }}</strong> a trouvé votre post-it ?
    </button>
    <hr />
    <button @click.prevent="quitGame" class="btn_secondary">
      Quitter la partie
    </button>
  </template>
</template>

<style lang="less" scoped>
@import "@/assets/css/vars.less";

.postit_list {
  width: 100%;
  margin: 30px auto 60px;

  display: flex;
  align-items: stretch;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  flex-direction: column;

  &.many_items {
    flex-direction: row;
  }
}

button {
  max-width: 320px;
}
</style>
