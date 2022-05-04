<template>

	<div v-if="showPostItForm" class="postit_form">
		<h3>Nouveau post-It de <strong>{{ postItName }}</strong></h3>
		<form v-on:submit.prevent="setNewPostIt">
			<input
				ref="new_post_it"
				type="text"
				placeholder="Personnage réel, fictif ou autre"
				maxlength="30"
				v-model="post_it"
				autocomplete="false"
				spellcheck="false"
			/>
			<button @click.prevent="setNewPostIt">Valider</button>
		</form>
	</div>

	<template v-else>
		<h4>{{ this.players[socket.id].pseudo }}</h4>

		<div class="postit_list">
			<div v-for="player in this.playersNotMe" class="postit_item">
				<div class="player_pseudo">{{ player.pseudo }}</div>

				<template v-if="player.postit_content">
					<div class="content">{{ player.postit_content }}</div>
					<div class="by">Fait par <strong>{{ this.players[player.postit_author].pseudo }}</strong></div>
				</template>

				<div class="incoming" v-else>
					<div class="waiting_icon"><div></div><div></div><div></div><div></div></div>
				</div>

			</div>
		</div>

		<button @click.prevent="postItFound">Vous avez trouvé votre post-it ?</button>
		<hr>
		<button @click.prevent="quitGame">Quitter la Game</button>
	</template>

</template>

<script>
	import $ from "jquery"
	import PostIt from '../components/PostIt.vue'

	export default {
		props: {
			socket: Object,
			players: Object
		},
		data() {
			return {
				showPostItForm: false,
				post_it: ''
			}
		},
		computed: {
			playersNotMe: function () {
				let result = {}
	
				for(let x in this.players){
					if(x !== this.socket.id) result[x] =this.players[x];
				}

				return result;
			},
			postItName: function(){
				for(let x in this.players){
					if(this.players[x].postit_author === this.socket.id)
						return this.players[x].pseudo
				}
			}
		},
		methods: {
			quitGame: function(){
				if(confirm("Voulez-vous vraiment quitter la partie ?")){
					this.socket.emit('quitGame', true)
					this.$emit('backHome');
				}
			},
			postItFound: function(){
				if(confirm("Voulez-vous un nouveau post-it ?")){
					this.socket.emit('changeMyPostIt', this.post_it)
				}
			},
			setNewPostIt(e) {
				this.socket.emit('setPostIt', this.post_it)
				this.showPostItForm = false
			}
		},
		mounted(){
			this.socket.on('newPostIt', (test) => {
				if(test){
					this.showPostItForm = true
					this.$refs.new_post_it.focus()
				}
			})
		},
		emits: ["backHome"],
		components: { PostIt }
	}
</script>

<style lang="less">
	@import "../assets/css/style-game.less";
</style>