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

<script lang="ts">
import { initViewer } from '../utils/viewerUtils';
import { startEvents } from '../startEvents';
import { Vue, Component } from 'vue-property-decorator';
import { throttle } from 'lodash';

let view: Autodesk.Viewing.Viewer3D;
@Component
class viewerApp extends Vue {
  stopEventListener: () => void;
  div: HTMLElement;
  async mounted() {
    const div = <HTMLElement>this.$refs.viewerDiv;
    view = await initViewer(div);
    this.div = view.canvas.parentElement!;
    this.stopEventListener = await startEvents(view);
    this.div.addEventListener('mousedown', this.onMouseDownBinded);
    this.div.addEventListener('mouseup', this.onMouseUpBinded);
  }

  onMouseDownBinded = this.onMouseDown.bind(this);
  onMouseDown() {
    this.$emit('onMouseDown');
  }
  onMouseUpBinded = this.onMouseUp.bind(this);
  onMouseUp() {
    this.$emit('onMouseUp');
  }

  beforeDestroy() {
    if (this.stopEventListener) this.stopEventListener();
    this.div.removeEventListener('mousedown', this.onMouseDownBinded);
    this.div.removeEventListener('mouseup', this.onMouseUpBinded);
  }
}

export default viewerApp;
</script>

<template>
  <div ref="viewerDiv" class="viewer-div-container"></div>
</template>

<style>
.viewer-div-container > .adsk-viewing-viewer {
  background: #fff;
}
</style>
