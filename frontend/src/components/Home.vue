<template>

	<div v-if="!tryreconnect">
		<form v-on:submit.prevent="joinRoom" class="join_room">
			<input
				ref="roomCode"
				type="text"
				placeholder="Code de la partie"
				maxlength="4"
				v-model="roomCode"
				v-on:keypress="digitOnly($event)"
				autocomplete="false"
				spellcheck="false"
			/>
			<button @click.prevent="joinRoom">Rejoindre une partie</button>
		</form>
		<hr>
		<div>
			<button @click.prevent="createRoom">Créer une partie</button>
		</div>
	</div>

	<div class="reconnect_loading" v-else>
		<h2>CHARGEMENT</h2>
	</div>
		
</template>

<script>
	export default {
		data() {
			return {
				roomCode: '',
			}
		},
		props: {
			tryreconnect: Boolean,
			socket: Object
		},
		methods: {
			createRoom(e) {
				this.socket.emit('createRoom')
			},
			joinRoom(e) {
				this.socket.emit('joinRoom', this.roomCode)
			},
			digitOnly(e){
				let char = String.fromCharCode(e.keyCode);
				if(/^[0-9]+$/.test(char)) return true;
				else e.preventDefault();
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "../assets/css/style-home.less";
</style>