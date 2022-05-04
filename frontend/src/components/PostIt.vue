<template>

	<h3>Post-It de <strong>{{ postItName }}</strong></h3>
	<form v-on:submit.prevent="setPostIt">
		<input
			ref="post_it"
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

<script>
	export default {
		data() {
			return {
				post_it: ''
			}
		},
		props: {
			socket: Object,
			players: Object,
		},
		computed: {
			postItName: function(){
				for(let x in this.players){
					if(this.players[x].postit_author === this.socket.id)
						return this.players[x].pseudo
				}
			}
		},
		methods: {
			setPostIt(e) {
				this.socket.emit('setPostIt', this.post_it)
				this.$emit('initGameView');
			}
		},
		mounted() {
			this.$refs.post_it.focus()
		},
		emits : ['initGameView']
	}
</script>

<style lang="less" scoped>
	@import "../assets/css/style-postit.less";
</style>