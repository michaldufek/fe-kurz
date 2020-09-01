<template>
  <div class="wrapper">
    <div class="">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar">

      </dashboard-content>
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script>
import TopNavbar from "@/custom/layout/application/patternLab/TopNavbar.vue";
import DashboardContent from "@/custom/layout/application/patternLab/Content.vue";
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
