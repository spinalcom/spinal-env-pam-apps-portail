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


export async function getPosition(data: { model: Autodesk.Viewing.Model, dbIds: number[] }[]) {
   const promises = data.map(({ model, dbIds }) => getObjectPosition(model, dbIds));
   const boxes = await Promise.all(promises);
   const box3 = boxes.reduce((box: THREE.Box3, b) => {
      box.union(b);
      return box;
   }, new THREE.Box3())
   return box3.getCenter();
}


function getObjectPosition(model: Autodesk.Viewing.Model, dbIds: number | number[]) {
   if (!Array.isArray(dbIds)) dbIds = [dbIds];

   return convertAllDbIdsToBox3(model, dbIds);

}

async function convertAllDbIdsToBox3(model: Autodesk.Viewing.Model, dbIds: number | number[]) {
   dbIds = Array.isArray(dbIds) ? dbIds : [dbIds];

   const instanceTree = model.getData().instanceTree;
   const fragList = model.getFragmentList();
   let bounds = new THREE.Box3();

   for (const id of dbIds) {
      await addToBounds(instanceTree, fragList, id, bounds);
   }

   return bounds;

}


function addToBounds(instanceTree: Autodesk.Viewing.Private.InstanceTree, fragList: Autodesk.Viewing.Private.FragmentList, dbId: number,bounds: THREE.Box3) : Promise<THREE.Box3> {

   try {
      instanceTree.enumNodeFragments(dbId, (fragId) => {
         let box = new THREE.Box3();
         fragList.getWorldBounds(fragId, box);
         bounds.union(box);
      }, true);
   } catch (error) {
      console.error(error);

   }
    

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