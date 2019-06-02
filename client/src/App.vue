<template>
  <div id="app">
    <div class="container">
      <the-header></the-header>

      <div class="row">
        <div class="col-12">
          <router-view/>  
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TheHeader from "./components/TheHeader";
import linearAlgebra from "./services/math/linearAlgebra";

export default {
  components: {
    TheHeader
  }
}
</script>


<style lang="scss">

</style>
