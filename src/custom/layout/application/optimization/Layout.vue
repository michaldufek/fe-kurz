<template>
  <div class="wrapper">
    <div class="row">
      <top-navbar />
      <dashboard-content @click.native="toggleSidebar" />
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script>
import TopNavbar from "@/custom/layout/application/optimization/TopNavbar.vue";
import DashboardContent from "@/custom/layout/application/optimization/Content.vue";
import MobileMenu from "@/layout/dashboard/MobileMenu";

export default {
  components: {
    TopNavbar,
    DashboardContent,
    MobileMenu
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    }
  }
};
</script>
