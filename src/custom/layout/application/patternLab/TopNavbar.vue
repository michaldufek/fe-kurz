<template>
  <nav class="navbar navbar-expand-lg navbar-absolute navbar-transparent">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div>
          <router-link class="navbar-brand" to="/research/patternLab/chart">{{$t("research.patternLab.chart.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/patternLab/patternStatistics">{{$t("research.patternLab.patternStatistics.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/patternLab/backtestPatterns">{{$t("research.patternLab.backtestPatterns.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/patternLab/alerts">{{$t("research.patternLab.alerts.title")}}</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
  export default {
  };
</script>
<style>
</style>