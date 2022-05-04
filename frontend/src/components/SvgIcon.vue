<template>
	<component :is="name"></component>
</template>

<script>
	import logo from "./svg/logo.vue"

	export default {
		props: {
			name: String
		},
		components: {
			logo
		},
	}
</script>