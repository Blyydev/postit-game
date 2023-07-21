<script setup>
import { onMounted, ref, inject } from "vue";

const $cookies = inject("$cookies");
const cookie_name = "sql_postit_pseudo";

const props = defineProps(["socket"]);

const pseudoInput = ref(null);
const pseudo = ref("");
const errorMsg = ref("");

const connecting = (e) => {
  let tmpPseudo = pseudo.value.replace(/[^a-zA-Z0-9]+/g, "-");
  if (tmpPseudo.length > 2 && tmpPseudo.length < 16) {
    $cookies.set(cookie_name, tmpPseudo, "30d");
    props.socket.emit("connectionRoom", tmpPseudo);
    errorMsg.value = "";
  } else {
    if (tmpPseudo.length < 3) errorMsg.value = "Pseudo trop court :(";
    if (tmpPseudo.length > 12) errorMsg.value = "Pseudo trop long :(";
    pseudoInput.value.focus();
  }
};

onMounted(() => {
  const cookiePseudo = $cookies.get(cookie_name);
  if (cookiePseudo) pseudo.value = cookiePseudo;
  pseudoInput.value.focus();
});

const returnHome = () => {
  emit("backHome");
};

const emit = defineEmits(["backHome"]);
</script>

<template>
  <form v-on:submit.prevent="connecting" class="login">
    <input
      ref="pseudoInput"
      type="text"
      placeholder="Pseudo"
      maxlength="15"
      v-model="pseudo"
      autocomplete="false"
      spellcheck="false"
    />
    <div class="error" v-show="errorMsg">{{ errorMsg }}</div>
    <button @click.prevent="connecting">Ok</button>
    <button @click.prevent="returnHome" class="btn_secondary">⬅ Retour</button>
  </form>
</template>

<style scoped lang="less">
button {
  width: 100%;
}
</style>
