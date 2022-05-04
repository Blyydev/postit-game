<template>

	<form v-on:submit.prevent="connecting" class="login">
		<input
			ref="pseudo"
			type="text"
			placeholder="Pseudo"
			maxlength="15"
			v-model="pseudo"
			autocomplete="false"
			spellcheck="false"
		/>
		<div class="error" v-show="errorMsg.length > 0">{{ errorMsg }}</div>
		<button @click.prevent="connecting">Ok</button>
	</form>

</template>

<script>
	export default {
		data() {
			return {
				pseudo: '',
				errorMsg:'',
			}
		},
		props: {
			socket: Object
		},
		computed: {
		},
		methods: {
			connecting(e) {
				let tmpPseudo = this.pseudo.replace(/[^a-zA-Z0-9]+/g, "-")				
				if((tmpPseudo.length > 2) && (tmpPseudo.length < 16)){
					this.socket.emit('connectionRoom', tmpPseudo)
					this.errorMsg = ""
				}else{
					if(tmpPseudo.length < 3) this.errorMsg = "Pseudo trop court :("
					if(tmpPseudo.length > 15) this.errorMsg = "Pseudo trop long :("
					this.$refs.pseudo.focus()
				}
			}
		},
		mounted() {
			this.$refs.pseudo.focus()
		}
	}
</script>