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


export async function getPosition(model: Autodesk.Viewing.Model, dbIds : number[]) {
   const box3 = await getObjectPosition(model, dbIds);
   return box3.getCenter();
}


function getObjectPosition(model: Autodesk.Viewing.Model, dbIds: number | number[]) {
   if (!Array.isArray(dbIds)) dbIds = [dbIds];

   return convertAllDbIdsToBox3(model, dbIds);


   // return Promise.all(promises).then((result) => {
   //    return result.flat().reduce((obj, {dbId, box}) => {
   //       obj[dbId] = { pos: box.getCenter(), color, text };
   //       return obj;
   //    }, {})
   // }).catch((err) => {
   //    console.error(err);
   // });
}

async function convertAllDbIdsToBox3(model: Autodesk.Viewing.Model, dbIds: number | number[]) {
   dbIds = Array.isArray(dbIds) ? dbIds : [dbIds];

   const instanceTree = model.getData().instanceTree;
   const fragList = model.getFragmentList();
   let bounds = new THREE.Box3();

   for (const id of dbIds) {
      const box = await convertDbIdToBox3(instanceTree, fragList, id);
      if(box) bounds.union(box);
   }

   return bounds;

   // const promises = dbIds.map(async id => ({
   //    dbId: id,
   //    box: await convertDbIdToBox3(instanceTree, fragList, id)
   // }));
   
   // return Promise.all(promises);
}


function convertDbIdToBox3(instanceTree: Autodesk.Viewing.Private.InstanceTree, fragList: Autodesk.Viewing.Private.FragmentList, dbId: number) : Promise<THREE.Box3> {
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
         resolve(undefined);
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