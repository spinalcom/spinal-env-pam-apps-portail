<!--
Copyright 2022 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <v-container class="appContainer"
               fluid>
    <div class="navbar">
      <NavBar />
    </div>

    <iframe class="iframeContainer"
            src="/micro-apps/first/index.html"></iframe>
  </v-container>
</template>

<script>
import NavBar from "../components/nav.vue";

export default {
  components: {
    NavBar,
  },
  data() {
    return {
      appSelected: {},
    };
  },
  mounted() {
    const { query, params } = this.$route;
    if (params.id && params.id === query.id) {
      this.appSelected = params;
      return;
    }
  },
};
</script>
<style scoped>
.appContainer {
  width: 100%;
  height: 99%;
  padding: 0px;
  background: red;
}

.appContainer .iframeContainer {
  width: 100%;
  height: 100%;
  background: yellow;
}

.appContainer .navbar {
  width: 450px;
  height: 60px;
  position: absolute;
  top: 5px;
  left: 0px;
}
</style>