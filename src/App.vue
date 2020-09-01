<template>
  <div>
    <notifications></notifications>
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
  export default {
    methods: {
      disableRTL() {
        if (!this.$rtl.isRTL) {
          this.$rtl.disableRTL();
        }
      },
      toggleNavOpen() {
        let root = document.getElementsByTagName('html')[0];
        root.classList.toggle('nav-open');
      },
      leaving() {
        if (!('remember' in localStorage) || !JSON.parse(localStorage.remember)) {
          this.$router.push('logout')
        }
      }
    },
    mounted() {
      this.$watch('$route', this.disableRTL, { immediate: true });
      this.$watch('$sidebar.showSidebar', this.toggleNavOpen)      
        
      if (!('locale' in localStorage)) {
        localStorage.setItem('locale', this.$root.$i18n.locale)
      } 
      this.$root.$i18n.locale = localStorage.locale
    },
    created() {
      window.addEventListener('beforeunload', this.leaving)
    }
  };
</script>

<style lang="scss">

</style>
