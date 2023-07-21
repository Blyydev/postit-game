<script setup>
import { ref } from "vue";

import PostitItem from "@/components/parts/PostitItem.vue";

const props = defineProps(["socket", "players"]);
const post_it = ref("");

const quitGame = () => {
  if (confirm("Voulez-vous vraiment quitter la partie ?")) {
    props.socket.emit("quitGame", true);
    emit("backHome");
  }
};

const postItFound = () => {
  if (confirm("Voulez-vous un nouveau post-it ?")) {
    props.socket.emit("changeMyPostIt", post_it.value);
  }
};

const emit = defineEmits(["backHome"]);
</script>

<template>
  <div class="postit_list">
    <PostitItem
      v-for="(player, playerID) in players"
      :pseudo="player.pseudo"
      :content="player.postit_content"
      :by="players[player.postit_author]?.pseudo"
      :isMe="playerID === props.socket.id"
    />
  </div>

  <button @click.prevent="postItFound">Vous avez trouvé votre post-it ?</button>
  <hr />
  <button @click.prevent="quitGame" class="btn_secondary">
    Quitter la partie
  </button>
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
}

button {
  max-width: 320px;
}

@media screen and (max-width: 875px) {
  .postit_list {
    flex-direction: column;
  }
}
</style>
