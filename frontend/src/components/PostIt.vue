<script setup>
import { onMounted, computed, ref } from "vue";

const props = defineProps(["socket", "players"]);

const post_it = ref("");
const postitInput = ref(null);

onMounted(() => {
  postitInput.value.focus();
});

const postItName = computed(() => {
  for (let x in props.players) {
    if (props.players[x].postit_author === props.socket.id)
      return props.players[x].pseudo;
  }
});

const setPostIt = (e) => {
  props.socket.emit("setPostIt", post_it.value);
  emit("initGameView");
};

const emit = defineEmits(["initGameView"]);
</script>

<template>
  <h3>
    Post-It de <strong>{{ postItName }}</strong>
  </h3>
  <form v-on:submit.prevent="setPostIt">
    <input
      ref="postitInput"
      type="text"
      placeholder="Personnage réel, fictif ou autre"
      maxlength="30"
      v-model="post_it"
      autocomplete="false"
      spellcheck="false"
    />
    <button @click.prevent="setPostIt">Valider</button>
  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/vars.less";

form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  button {
    margin-top: 15px;
    width: 100%;
  }
}
</style>
