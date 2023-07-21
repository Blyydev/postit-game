<script setup>
const props = defineProps(["pseudo", "content", "by", "isMe"]);
</script>

<template>
  <div class="postit_item" :class="{ me: props.isMe }">
    <div class="player_pseudo">{{ props.pseudo }}</div>

    <template v-if="props.content">
      <div class="content">
        <template v-if="!props.isMe">{{ props.content }}</template>
      </div>
      <div class="by">
        Fait par <strong>{{ props.by }}</strong>
      </div>
    </template>

    <div class="incoming" v-else>
      <div class="waiting_icon">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/vars.less";

.postit_item {
  margin: 0 6px 12px;

  position: relative;
  padding: 5px;

  background: @bg;
  border: 3px;
  background-clip: padding-box;
  border: solid 3px transparent;

  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 0 1 33.333%;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    z-index: -1;
    margin: -3px;
    border-radius: inherit;
    background: linear-gradient(145deg, crimson, @purple);
  }

  div {
    text-align: center;
    display: block;

    &.player_pseudo {
      .heebo(1rem, @greylight, 200);
      letter-spacing: 1.5px;
    }

    &.content {
      .roboto(1.5rem, @white);
      line-height: 1;
      margin: 3px 0 5px;
    }

    &.by {
      .heebo(0.85rem, @red, 400);
      font-style: italic;
    }
  }

  &:nth-child(even):before {
    background: linear-gradient(145deg, @purple, crimson);
  }

  &.me {
    &:before {
      margin: -6px;
      background: linear-gradient(175deg, @green, @purpledark);
    }
    .player_pseudo {
      color: #fff;
      font-weight: bold;
    }
    .content:before {
      content: "???";
    }
  }
}

.incoming {
  .waiting_icon {
    position: relative;
    width: 50px;
    height: 20px;
    margin: 0 auto;

    div {
      position: absolute;
      top: 0px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: @white;
      animation-timing-function: cubic-bezier(0, 1, 1, 0);

      &:nth-child(1) {
        left: 0px;
        animation: lds-ellipsis1 0.6s infinite;
      }
      &:nth-child(2) {
        left: 0px;
        animation: lds-ellipsis2 0.6s infinite;
      }
      &:nth-child(3) {
        left: 20px;
        animation: lds-ellipsis2 0.6s infinite;
      }
      &:nth-child(4) {
        left: 40px;
        animation: lds-ellipsis3 0.6s infinite;
      }
    }
  }
}

@media screen and (max-width: 875px) {
  .postit_item {
    width: 80%;
    flex: 0 1 100px;
  }
}
</style>
