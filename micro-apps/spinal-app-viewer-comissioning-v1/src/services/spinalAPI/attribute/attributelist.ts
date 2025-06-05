


import { SpinalAPI } from 'global-components/requests';
import lodash from 'lodash';

export async function getAttributeList(buildindId: string, item: any[]) {
    const spinalAPI = SpinalAPI.getInstance();
    const dynamicIds = item.map((item) => item.dynamicId);
    const url = 'api/v1/node/attribute_list_multiple';
    const response = await sendListMultipleRequest(buildindId, dynamicIds, url);
    const data = item.map((el) => {
        const found = response.find((obj) => obj.dynamicId === el.dynamicId);
        if (found) {
            return {
                ...el,
                attributes: found.categoryAttributes,
            };
        }
        return el;
    })
    return data;
}












 async function sendListMultipleRequest(
  buildingId: string,
  dynamicIds: number[],
  argUrl: string,
  size: number = 200
) {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId, argUrl);

 


 
  const chunked = lodash.chunk(dynamicIds, size);
 
  let results: any[] = [];

  
  const promises = chunked.map(async (ids, index) => {
    try {
      const response = await spinalAPI.post(url, ids) as any;
      if (response.status === 200 || response.status === 206) {
        
        results.push(...response.data);
        
  
      } else {
        console.warn(`Chunk ${index + 1} a retourné un status inattendu`, response.status);
        
      }
    } catch (error) {
      console.error(`Erreur sur le chunk ${index + 1}`, error);
    
  }

  }
);
  
await Promise.all(promises);
  
  return results;
}