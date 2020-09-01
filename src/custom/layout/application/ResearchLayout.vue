<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link to="/research/portfolioManager" :name="$t('sidebar.portfolioManager')" icon="tim-icons icon-chart-pie-36"/>
        <sidebar-link to="/research/stockPickingLab" :name="$t('sidebar.stockPickingLab')" icon="tim-icons icon-tap-02"/>
        <sidebar-link to="/research/patternLab" :name="$t('sidebar.patternLab')" icon="tim-icons icon-sound-wave"/>
        <sidebar-link to="/research/optimization" :name="$t('sidebar.optimization')" icon="tim-icons icon-vector"/>
        <sidebar-link to="/research/fsengineering" :name="$t('sidebar.fsengineering')" icon="tim-icons icon-atom"/>
        <!-- <sidebar-link to="/research/relativeValuesLab" :name="$t('sidebar.relativeValuesLab')" icon="tim-icons icon-tap-02"/> -->
        <sidebar-link to="/research/wareHouse" :name="$t('sidebar.wareHouse')" icon="tim-icons icon-paper"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar">

      </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script>
import TopNavbar from "@/custom/layout/application/TopNavbar.vue";
import ContentFooter from "@/custom/layout/application/ContentFooter.vue";
import DashboardContent from "@/layout/dashboard/Content.vue";
import MobileMenu from "@/layout/dashboard/MobileMenu";

export default {
  components: {
    TopNavbar,
    ContentFooter,
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
