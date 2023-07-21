<script setup>
import { computed } from "vue";
import _ from "lodash";

const props = defineProps(["players", "roomId", "admin", "socket"]);

const orderedPlayers = computed(() => {
  return _.orderBy(props.players, "pseudo");
});

const roomIdNoSlash = computed(() => {
  return props.roomId.replace("/", "");
});

const isAdmin = computed(() => props.admin === props.socket.id);

const startgame = () => {
  if (
    props.players.constructor === Object &&
    Object.keys(props.players).length > 1
  )
    props.socket.emit("startgame");
};
</script>

<template>
  <div class="wrapper">
    <h2>En attente du début de la partie</h2>

    <div class="room_code">
      <span>Code de la partie :</span><strong>{{ roomIdNoSlash }}</strong>
    </div>

    <div class="players_list">
      <div v-for="player in orderedPlayers" class="player_item" :key="player">
        <span
          v-if="admin === player.id"
          class="admin"
          title="Admin de la partie"
          >🔥</span
        >
        <div class="pseudo">{{ player.pseudo }}</div>
      </div>
    </div>

    <div class="admin_bloc" v-if="isAdmin">
      <button @click.prevent="startgame" class="start_btn">
        Commencer la partie
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/vars.less";

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.room_code {
  background: @greywhite;
  padding: 8px 30px;
  border-radius: 5px;

  span {
    user-select: none;
    .heebo(1.25rem, @greydark, 200);
  }

  strong {
    .roboto(1.5rem, @red);
    font-weight: bold;
    margin-left: 10px;
    text-shadow: 0px 0px 3px #f3000085;
  }
}

.players_list {
  width: 100%;
  max-width: 250px;
  margin: 30px auto;

  .player_item {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 90%;
    margin: auto;
    margin-bottom: 10px;

    position: relative;
    padding: 5px;

    background: @bg;
    border: 2px;
    background-clip: padding-box;
    border: solid 2px transparent;

    border-radius: 5px;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      z-index: -1;
      margin: -2px;
      border-radius: inherit;
      background: linear-gradient(145deg, crimson, @purple);
    }

    .admin {
      margin-top: -3px;
      margin-right: 8px;
      cursor: default;
    }

    .pseudo {
      .heebo(1.25rem, @greylight, 400);
    }

    &:nth-child(even):before {
      background: linear-gradient(145deg, @purple, crimson);
    }
  }
}

.admin_bloc {
  width: 100%;
}
</style>
