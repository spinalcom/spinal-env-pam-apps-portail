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

import { ISource } from "../../../interfaces/IConfig";
import { SpinalAPI } from "../SpinalAPI";



export async function getSourceValue(buildingId: string, items: any[], source: ISource) {
   const { dynamicIds, obj } = _formatValues(items);
   const controlEnpoints = await getcontrolEndpointListMultiple(buildingId, dynamicIds);
   _classifyControlPoints(controlEnpoints, obj, source);
}


async function getcontrolEndpointListMultiple(buildingId: string, dynamicIds: string[]) {
   const spinalAPI = SpinalAPI.getInstance();
   const url = spinalAPI.createUrlWithPlatformId(buildingId, "/api/v1/node/control_endpoint_list_multiple");
   let result = await spinalAPI.post<any>(url,dynamicIds);
   return result.data || [];
}


function _classifyControlPoints(controlEnpoints: any, itemsObj: any, source: ISource) {
   
   for (const data of controlEnpoints) {
      const dynamicId = data[0]?.dynamicId || 0;
      const item = itemsObj[dynamicId];
      if (item) item.endpoint = getEndpoint(data);
   }


   function getEndpoint(_c: any[]) {
      for (const {endpoints, profileName} of _c) {
         if (profileName === source.profileName) {
            return endpoints.find(el => el.name === source.name);
         }
      }
   }
}

function _formatValues(items: any[]) {
   return items.reduce((data:{dynamicIds: any[], obj : any}, item) => {
      if (!item.endpoint){ 
         data.dynamicIds.push(item.dynamicId);
         data.obj[item.dynamicId] = item;
      }
      return data;
   }, {dynamicIds: [], obj : {}})
}