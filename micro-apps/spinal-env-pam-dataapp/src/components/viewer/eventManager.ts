/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
import { EmitterViewerHandler, VIEWER_INITIALIZED, VIEWER_START_LOAD_MODEL } from 'spinal-viewer-event-manager';
export const emitter = EmitterViewerHandler.getInstance();
emitter.setTarget(window.parent.parent, 'data-view');
import { setUpContextMenu } from '../../setUpContextMenu';
import { SpinalAPI } from '../../services/spinalAPI/SpinalAPI';
import { sceneDefaut } from '../../services/spinalAPI/BIM/sceneDefault';
import { IViewInfoItemRes, getViewInfo } from '../../services/spinalAPI/GeographicContext/getViewInfo';
import { getBIMFileContext } from '../../services/spinalAPI/BIM/BIMFileContext';
import { getAllParentThemes } from 'floating-vue/dist/config';

export function startViewer(item: any): void {
  // start the viewer
  emitter.once(VIEWER_INITIALIZED, onViewerStarted);
  const buildingId = item.buildingId;
  const dynamicId = item.dynamicId;
  
  async function onViewerStarted() {
    const spinalAPi = SpinalAPI.getInstance();
    const defaultScene = await sceneDefaut(spinalAPi, buildingId);
    const data = {
      buildingId: buildingId,
      loadingType: defaultScene.sceneAlignMethod,
      models: await getAndFormatModels(buildingId, dynamicId)
      // models: defaultScene.scenesItems.map((itm) => {
      //   return {
      //     id: itm.staticId,
      //     name: itm.name,
      //     path: itm.item,
      //     aecPath: itm.aecPath,
      //   };
      // }),
    };

    console.log(data)

    emitter.emit(VIEWER_START_LOAD_MODEL, data);
    setUpContextMenu(emitter);
  }
}

export async function getAndFormatModels(buildingId: string, nodeDynamicId: number) {
  const [viewerInfos,bimFiles] = await Promise.all([getViewInfo(buildingId, { dynamicId: nodeDynamicId, floorRef: true, roomRef: true, equipements: true }), getBIMFileContext(buildingId) ])
  const viewMerged = mergeIViewInfo(viewerInfos[0].data);

  return bimFiles.reduce((list, itm) => {
    const dbids = viewMerged[itm.staticId];
    if (dbids && dbids.length > 0) {
      list.push({
        id: itm.staticId,
        name: itm.name,
        path: getPath(itm),
        dbids
      })
    }

    return list
    
  }, [])
}


function mergeIViewInfo(bimFiles: IViewInfoItemRes[]) {
  return bimFiles.reduce((obj, item) => {
    if (obj[item.bimFileId]) obj[item.bimFileId].push(...item.dbIds);
    else obj[item.bimFileId] = item.dbIds;

    return obj;
  }, {})
}

function getPath(itm: any) {
  const path : string = itm.items[0]?.path || "";

  return path.replace("/html/viewerForgeFiles", "");
}