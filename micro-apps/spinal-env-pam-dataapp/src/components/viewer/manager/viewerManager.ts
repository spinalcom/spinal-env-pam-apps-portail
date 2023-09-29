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

import { ModelManager } from "./modelManager"
import { getViewInfo, getViewInfoFormatted, IViewInfoItemRes, IViewInfoTmpRes, mergeIViewInfo } from '../requests/GeographicContext/getViewInfo';
import { IPlayload } from "../interfaces/IPlayload";
import { EmitterViewerHandler, VIEWER_INITIALIZED, VIEWER_OBJ_FIT_TO_VIEW, VIEWER_OBJ_ISOLATE, VIEWER_OBJ_SELECT, VIEWER_START_LOAD_MODEL, ViewerEventWithData } from "spinal-viewer-event-manager";
import { VIEWER_EVENTS } from "../events";

export class ViewerManager {
   private static _instance: ViewerManager;
   public viewer: Autodesk.Viewing.Viewer3D;
   public modelManager: ModelManager = ModelManager.getInstance();
   private _buildingInfo: any = {}
   private _viewerStores = {}
   private _viewerStartedList : {[key: string] : Set<string>} = {}

   private constructor() { }
   
   public static getInstance(): ViewerManager {
      if (!this._instance) this._instance = new ViewerManager();
      return this._instance;
   }

   /////////////////////////////////////////////////////////////////////////
   //                           Viewer                                    //
   /////////////////////////////////////////////////////////////////////////

   public initViewer(viewerDiv: HTMLElement): Promise<Autodesk.Viewing.Viewer3D> {
      return new Promise((resolve) => {
         const options = {
            env: 'Local',
            docid: '',
            useADP: false,
         };
         Autodesk.Viewing.Initializer(options, function () {
            if (viewerDiv) {
               const customProfileSettings = Autodesk.Viewing.DefaultSettings;
               customProfileSettings.lightPreset = 7;
               customProfileSettings.ghosting = false;
               const viewer: Autodesk.Viewing.Viewer3D = new Autodesk.Viewing.Viewer3D(viewerDiv, customProfileSettings);
               resolve(viewer);
            }
         });
      });
   }

   public async loadInViewer(item: IPlayload, loadOnlyThisModel : boolean = true) {

      if (this._viewerStartedList[item.staticId]) return;

      if (loadOnlyThisModel) {
         const items = Object.keys(this._viewerStartedList);
         await this.unload(items);
      }     

      const emitter = EmitterViewerHandler.getInstance();

      emitter.once(VIEWER_INITIALIZED, async () => {
         const buildingId = item.buildingId;
         const dynamicId = item.dynamicId;
         const res = await this.getViewerInfo(item);
         
         emitter.once(<any>VIEWER_EVENTS.LOADED, (data) => {
            this._addViewLoaded(data.id, data.models);
         })

         const viewerInfo = await getViewInfoFormatted(buildingId, res, item);
         emitter.emit(VIEWER_START_LOAD_MODEL, viewerInfo);
      })
   }

   public async getViewerInfo(item: IPlayload): Promise<IViewInfoItemRes[]> {
      if (typeof this._viewerStores["GET_VIEWER_INFO"] === 'undefined') {
         this._viewerStores["GET_VIEWER_INFO"] = {};
      }

      if (typeof this._viewerStores["GET_VIEWER_INFO"][item.dynamicId] === "undefined") {

         const ids =  [item.dynamicId];
         const res: IViewInfoTmpRes[] = [];
         const nodeTofetech: number[] = [];

         for (const dynId of ids) {
            if (this._buildingInfo[dynId]) {
               mergeIViewInfo(res, this._buildingInfo[dynId]);
            } else {
               nodeTofetech.push(dynId);
            }
         }

         if (nodeTofetech.length > 0) {
            const datas = await getViewInfo(item.buildingId, { dynamicId: nodeTofetech, floorRef: true, roomRef: true, equipements: true });
            for (const _item of datas) {
               mergeIViewInfo(res, _item.data);
            }
         }

            async function* generator(): AsyncGenerator<Awaited<any>> {
               const data = res.map((it: IViewInfoTmpRes): IViewInfoItemRes => {
                  return { bimFileId: it.bimFileId, dbIds: Array.from(it.dbIds) };
               });
               while (true) {
                  yield data;
               }
            }
            
            this._viewerStores["GET_VIEWER_INFO"][item.dynamicId] = generator();
         }

         const items = await this._viewerStores["GET_VIEWER_INFO"][item.dynamicId].next();
         return items?.value;
   }

   public select(item: IPlayload) {
      return this._fctViewerIteract(VIEWER_OBJ_SELECT, item);
   }

   public isolate(item: IPlayload) {
      return this._fctViewerIteract(VIEWER_OBJ_ISOLATE, item);
   }

   public fitToView(item: IPlayload) {
      return this._fctViewerIteract(VIEWER_OBJ_FIT_TO_VIEW, item);
   }

   public unload(item: (IPlayload | string)|(IPlayload | string)[]) {
      return this._fctViewerIteract(VIEWER_EVENTS.UNLOAD as any, item);
   }

   private async _fctViewerIteract(eventName: keyof ViewerEventWithData, playload: (IPlayload | string) | (IPlayload | string)[]): Promise<any> {
      const emitter = EmitterViewerHandler.getInstance();

      if (eventName === (VIEWER_EVENTS.UNLOAD as any)) {
         playload = Array.isArray(playload) ? playload : [playload];
         const obj = {};

         const modelIds = playload.map((item) => {
            return typeof item === "string" ? item : item?.staticId;
         })

         emitter.emit(eventName, modelIds as any);
         
         playload.forEach(item => {
            const _tempId = typeof item === "string" ? item : item?.staticId;
            this._removeViewLoaded(_tempId);
         });
         
         return;
      }

      const data: IViewInfoItemRes[] = await  this.getViewerInfo(playload as IPlayload);
      const res = data.map((it) => {
         return {
            dbIds: it.dbIds,
            // modelId: it.bimFileId,
            modelId: (playload as IPlayload).floorId || (playload as IPlayload).staticId
         };
      });

      emitter.emit(eventName, res);
   }

   private _addViewLoaded(nodeId: string, models : any[] ) {
      if (!this._viewerStartedList[nodeId]) this._viewerStartedList[nodeId] = new Set([]);
      for (const model of models) {
         this._viewerStartedList[nodeId].add(model.id);
      }
   }

   private _removeViewLoaded(nodeId: string) {
      delete this._viewerStartedList[nodeId]; 
   }
}

export default ViewerManager