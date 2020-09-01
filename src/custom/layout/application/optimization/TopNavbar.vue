<template>
  <nav class="navbar navbar-expand-lg navbar-absolute navbar-transparent">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div style="">
          <router-link class="navbar-brand" to="/research/optimization/parameterSweep">{{$t("research.optimization.parameterSweep.title")}}</router-link>
          <router-link class="navbar-brand" to="/research/optimization/genetics">{{$t("research.optimization.genetics.title")}}</router-link>
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