/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import { IDbIdModelAggregate, IStartLoadModel, SceneAlignMethod } from "spinal-viewer-event-manager";
import { IloadModelTask } from "../interfaces/ILoadModelTask";
import { load1stThenAll } from "./load1stThenAll";
import { getGlobalOffset } from "./getGlobalOffset";
import { addOffsetFromAEC } from "./addOffsetFromAEC";
import { getAPINormalisePath } from "./getAPINormalisePath";
import { ModelManager } from '../manager/modelManager';



export class ViewerUtils {

  private static _instance : ViewerUtils;
  private _isFirstModel: boolean = true;
  
  private constructor() { }
  
  public static getInstance(): ViewerUtils {
    if (!this._instance) this._instance = new ViewerUtils;

    return this._instance;
  }

  async load3DModels(viewer: Autodesk.Viewing.Viewer3D, data: IStartLoadModel): Promise<Autodesk.Viewing.Model[]> {
    const tasks: IloadModelTask[] = [];
  
    for (const d of data.models) {
      tasks.push({
        path: this._addSlash(d.path),
        dbids: d.dbids,
        aecPath: this._addSlash(d.aecPath),
        id: d.id,
        name: d.name,
      });
    }

    return load1stThenAll( tasks, async (d: IloadModelTask): Promise<Autodesk.Viewing.Model> => {
      return this.loadBimFile(viewer, d.path, data.loadingType as any, d.id, d.dbids, d.aecPath, data.buildingId);
        // addNewModel(d.id, model);
    }, this._isFirstModel)
      .then((result) => {
        return result;
      })
  }

  async loadBimFile(viewer: Autodesk.Viewing.Viewer3D, urlpath: string, sceneAlignMethod: SceneAlignMethod, modelId: string, dbids?: number[],aecPath?: string, buildingId?: string ): Promise<Autodesk.Viewing.Model> {
    try {
      const option: { globalOffset?: THREE.Vector3; applyRefPoint?: boolean; ids?: number[]; } = {};

      if (dbids) {
        option.ids = dbids;
      }
      
      if (sceneAlignMethod === SceneAlignMethod.OriginToOrigin) {
        option.globalOffset = getGlobalOffset(viewer);
      } else if (sceneAlignMethod === SceneAlignMethod.ShareCoordinates && aecPath) {
        option.applyRefPoint = true;
        option.globalOffset = await addOffsetFromAEC(getAPINormalisePath(aecPath, buildingId), viewer);
      }


      const path = getAPINormalisePath(urlpath, buildingId);
      const model = await this._loadModel(modelId, viewer, path, option, this._isFirstModel);
      if (this._isFirstModel) this._isFirstModel = false;

      return model;
    } catch (error) {
      
    }
    
  }

  async unloadModel(viewer: Autodesk.Viewing.Viewer3D, arg_modelIds: string[]) {
    if (!arg_modelIds || arg_modelIds.length === 0) return;

    const instance = ModelManager.getInstance();
    for (const id of arg_modelIds) {
      const models = instance.getModelById(id);
      if (models) {
        for (const model of models) {
          (viewer.impl as any).unloadModel(model);
        }
        instance.deleteModel(id);
      }
    }

    // const models = (viewer.impl as any).modelQueue()?.getModels() || [];
    // for (let i = 0; i < models.length; i++) {
    //   const model = models[i];
    //   if (arg_modelIds.has(model.id)) {
    //     (viewer.impl as any).unloadModel(model);
    //     i--;
    //   }
    // }
    
  }

  clearSelect(viewer: Autodesk.Viewing.Viewer3D): void {
    viewer.clearSelection();
  }

  viewerSelect(viewer: Autodesk.Viewing.Viewer3D, data: IDbIdModelAggregate[]): void {
    this.clearSelect(viewer);

    if (data.length === 1) {
      const d = data[0];
      const model = ModelManager.getInstance().getModelById(d.modelId)
      viewer.select(d.dbIds, model[0]);
    } else {
      for (const d of data) {
      const model = ModelManager.getInstance().getModelById(d.modelId)
        const ids = typeof d.dbIds === 'number' ? [d.dbIds] : d.dbIds;
        // @ts-ignore
        model.selector.setSelection(ids);
      }
      try {
        this._fireAggregateSelectionChangedEvent(viewer);
      } catch (e) {
        console.error(
          'error while trying to fire AggregateSelectionChanged Event'
        );
      }
    }
  }


  viewerIsolation(viewer: Autodesk.Viewing.Viewer3D, data: IDbIdModelAggregate[]): void {
    const aggregateIsolation = viewer.getAggregateIsolation();

    if (this._isSameData(data, aggregateIsolation)) {
      for (const d of aggregateIsolation) {
        viewer.isolate(0, d.model);
      }

      const hiddenModels = viewer.getHiddenModels();
      for (const model of hiddenModels) {
        viewer.showModel(model.id,false)
      }
    
    } else {
      const modelDico = ModelManager.getInstance().getModelList();      

      for (const [modelId, models] of modelDico) {
        let found = false;
        for (const d of data) {
          if (modelId == d.modelId) {
            found = true;
            for (const m of models) {
              if (d.dbIds.length > 0) {
                viewer.isolate(d.dbIds, m);
              } else {
                let rootId = m.getRootId();
                m.getObjectTree((tree) => {
                  let dbidRoot = tree.nodeAccess.dbIdToIndex[rootId];
                  viewer.isolate([dbidRoot], m);
                });
              }
            }
           
          }
        }

        if (found === false) {
          for (const model of models) {
            viewer.hideModel( model);
          }
        }
      }
    }
  }


  viewerFitToView(viewer: Autodesk.Viewing.Viewer3D, data: IDbIdModelAggregate[] ): void {
  const res = data.map((d) => {
    return {
      model: ModelManager.getInstance().getModelById(d.modelId)[0],
      selection: d.dbIds,
    };
  });
  // @ts-ignore
  viewer.fitToView(res);
}



  ///////////////////////////////////////////////////////////////////
  //                            PRIVATE                            //
  ///////////////////////////////////////////////////////////////////


  private _addSlash(path: string): string {
    if (path) return path[0] === '/' ? path : '/' + path;
    return "";
  }

  private _loadModel(modelId: string, viewer: Autodesk.Viewing.Viewer3D, path: string, option: any = {}, start: boolean = false): Promise<Autodesk.Viewing.Model> {
    return new Promise((resolve, reject) => {
      let m : Autodesk.Viewing.Model = undefined;
      const fn = (e: any) => {

        if (m && e.model.id === m.id) {
          viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
          resolve(m);
        }
      };

      viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
      
      let fct = start ? viewer.start : viewer.loadModel;
      fct.call(viewer, path, option, (model: Autodesk.Viewing.Model): void => {
        ModelManager.getInstance().addNewModel(modelId, model);
          m = model;
      }, reject );
    });
  }

  private _fireAggregateSelectionChangedEvent(viewer: Autodesk.Viewing.Viewer3D) {
    var perModel: any[] = [];
    for (const [, models] of ModelManager.getInstance().getModelList()) {
      for (const model of models) {
        var dbIdArray: number[] = [];
        var fragIdsArray: any[] = [];
        // @ts-ignore
        var sset = model.selector.selectedObjectIds;
        // @ts-ignore
        var instanceTree = model.selector.getInstanceTree();
        for (var p in sset) {
          if (sset[p]) {
            var dbId = parseInt(p);
            if (dbId) {
              dbIdArray.push(dbId);

              if (instanceTree) {
                instanceTree.enumNodeFragments(
                  dbId,
                  function (fragId) {
                    fragIdsArray.push(fragId);
                  },
                  false
                );
              }
            }
          }
        }

        if (dbIdArray.length) {
          perModel.push({
            fragIdsArray: fragIdsArray,
            dbIdArray: dbIdArray,
            nodeArray: dbIdArray,
            model: model,
          });
        }
      }
    }

    var event = {
      type: Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      selections: perModel,
    };
    // @ts-ignore
    viewer.impl.api.dispatchEvent(event);
  }


  private _isSameData(data1: IDbIdModelAggregate[], data2: { ids: number[]; model: Autodesk.Viewing.Model }[] ): boolean {
    if (data1.length !== data2.length) return false;
    for (const d1 of data1) {
      const models = ModelManager.getInstance().getModelById(d1.modelId);
      if(!models) return false
      let found: any = [];
      for (const d2 of data2) {
        if (models.find(el => el.id === d2.model.id)) {
          if (checkdbIds(d1.dbIds, d2.ids) === false) return false;
          found.push(d2);
          if(found.length === models.length) return true
          break;
        }
      }
      if (found.length !== models.length) return false;
    }
    return true;
  }

}

function checkdbIds(dbid1: number[], dbid2: number[]): boolean {
  if (dbid1.length !== dbid2.length) return false;
  for (const d1 of dbid1) {
    let found = false;
    for (const d2 of dbid2) {
      if (d1 === d2) {
        found = true;
        break;
      }
    }
    if (found === false) return false;
  }
  return true;
}