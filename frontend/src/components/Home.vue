<script setup>
import { ref } from "vue";

const roomCode = ref("");
const props = defineProps(["socket"]);

const createRoom = () => {
  props.socket.emit("createRoom");
};

const joinRoom = () => {
  props.socket.emit("joinRoom", roomCode.value);
};

const digitOnly = (e) => {
  let char = String.fromCharCode(e.keyCode);
  if (/^[0-9]+$/.test(char)) return true;
  else e.preventDefault();
};
</script>

<template>
  <div>
    <form v-on:submit.prevent="joinRoom" class="join_room">
      <input
        ref="roomCodeInput"
        type="text"
        placeholder="Code de la partie"
        maxlength="4"
        v-model="roomCode"
        v-on:keypress="digitOnly($event)"
        autocomplete="false"
        spellcheck="false"
        pattern="\d*"
        novalidate
      />
      <button @click.prevent="joinRoom">Rejoindre une partie</button>
    </form>
    <hr />
    <div>
      <button @click.prevent="createRoom">Créer une partie</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/vars.less";

.join_room {
  margin-bottom: 30px;

  input {
    max-width: 300px;
    .roboto(2rem, @white);
    font-weight: bold;

    &::placeholder {
      .heebo(1.25rem, @greylight, 200);
      padding-bottom: 10px;
    }
  }
}

button {
  width: 100%;
}
</style>
