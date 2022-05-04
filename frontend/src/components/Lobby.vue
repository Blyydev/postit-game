<template>

	<h2>En attente du début de la partie</h2>

	<div class="room_code">
		<span>Code de la partie :</span><strong>{{ roomIdNoSlash }}</strong>
	</div>

	<div class="players_list">
		<div v-for="player in orderedPlayers" class="player_item" :key="player">
			<span v-if="admin === player.id" class="admin" title="Admin de la partie">🔥</span><div class="pseudo">{{ player.pseudo }}</div>
		</div>
	</div>

	<div class="admin_bloc" v-if="admin === socket.id">
		<button @click.prevent="startgame" class="start_btn">Commencer la partie</button>
	</div>

</template>

<script>
	import _ from 'lodash'
	import $ from "jquery"

	export default {
		props: {
			players: Object,
			roomId: String,
			admin: String,
			socket: Object
		},
		data(){
			return {
			}
		},
		computed: {
			orderedPlayers: function() {
				return _.orderBy(this.players, 'pseudo')
			},
			roomIdNoSlash: function(){
				return this.roomId.replace('/','');
			}
		},
		methods: {
			startgame(){
				if(this.players.constructor === Object && Object.keys(this.players).length > 1 )
					this.socket.emit('startgame')
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "../assets/css/style-lobby.less";
</style>