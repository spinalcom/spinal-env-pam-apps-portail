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

import ModelManager from "../manager/modelManager";

export function getAllObjectsPositionsAndFormat(data: any) {
   const promises = data.map(({color, dbIds, modelId, value}) => {
      const models = ModelManager.getInstance().getModelById(modelId);       
      if (!models) return Promise.resolve([]);
      return getObjectPosition(models, dbIds,color, value);
   })

   return Promise.all(promises).then((result: { [key: number]: { pos: THREE.Vector3, color: string;  text: string}}[]) => {
      const obj = convertResultToObj(result);
      return Array.from(Object.values(obj));
   })
}

function getObjectPosition(model: Autodesk.Viewing.Model |Autodesk.Viewing.Model[], dbIds: number|number[], color: string, text: string) {
   if (!Array.isArray(model)) model = [model];
   if (!Array.isArray(dbIds)) dbIds = [dbIds];

   const promises = model.map((m) => {
      return convertAllDbIdsToBox3(m, dbIds);
   })

   return Promise.all(promises).then((result) => {
      return result.flat().reduce((obj, {dbId, box}) => {
         obj[dbId] = { pos: box.getCenter(), color, text };
         return obj;
      }, {})
   }).catch((err) => {
      console.error(err);
   });
}

function convertAllDbIdsToBox3(model: Autodesk.Viewing.Model, dbIds: number | number[]) {
   const instanceTree = model.getData().instanceTree;
   const fragList = model.getFragmentList();
   let bounds = new THREE.Box3();

   const promises = dbIds.map(async id => ({
      dbId: id,
      box: await convertDbIdToBox3(instanceTree, fragList, id)
   }));
   
   return Promise.all(promises);
}


function convertDbIdToBox3(instanceTree: Autodesk.Viewing.Private.InstanceTree, fragList: Autodesk.Viewing.Private.FragmentList, dbId: number) {
   return new Promise((resolve, reject) => {
      const timeoutID = setTimeout(() => reject('took too long'), 2000);
      
      try {
         instanceTree.enumNodeFragments(dbId, (fragId) => {
            let box = new THREE.Box3();
            fragList.getWorldBounds( fragId, box );
            resolve(box);
         }, false);
      } catch (error) {
         console.error(error);
         reject(error);
      }
      
   });
}

function convertResultToObj(result: { [key: number]: { pos: THREE.Vector3, color: string;  text: string}}[]) {
   return result.reduce((obj, item: {[key:number] : THREE.Vector3}) => {
      if (item) {
         for (const key in item) {
            obj[key] = item[key];
         }
      }
      return obj;
   }, {})
}