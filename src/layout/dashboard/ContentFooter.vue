<template>
  <footer class="footer">
    <div class="container-fluid">
      <ul class="nav">
        <li class="nav-item">
          <a class="nav-link" href="https://www.cyrrusadvisory.cz/">
            Cyrrus Advisory
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://www.cyrrusadvisory.cz/category/novinky/">
            Blog
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://www.analyticalplatform.com/">
            Analytical Platform
          </a>
        </li>
      </ul>
      <div class="copyright">
        © {{year}} made by
        <a href="https://www.cyrrusadvisory.cz/" target="_blank" rel="noopener">Cyrrus Advisory</a> as a showroom.
      </div>
    </div>
  </footer>
</template>
<script>
  export default {
    data() {
      return {
        year: new Date().getFullYear()
      }
    }
  };
</script>
<style>
</style>
