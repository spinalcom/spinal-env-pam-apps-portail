import { SpinalAPI } from "../SpinalAPI";
import lodash from "lodash";

// export async function Attribute_list_multiple(dynamicIds: number[]){
//   const platformId = localStorage.getItem("idBuilding") || "";
//   const spinalAPI = SpinalAPI.getInstance();
//   const url = spinalAPI.createUrlWithPlatformId(
//     platformId,
//     `api/v1/node/attribute_list_multiple`
//   );
//   let result = await spinalAPI.post(url, dynamicIds);
//   return result.data;
// }
export async function Attribute_list_multiple(dynamicIds: number[]) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/node/attribute_list_multiple`
  );

  // Divide the dynamicIds into chunks of 200
  const promises = lodash.chunk(dynamicIds, 200).map(async (chunk) => {
    return spinalAPI.post(url, chunk);
  });
  return Promise.allSettled(promises).then((results) => {
    return results.reduce((list, { status, value }) => {
      if (status === "fulfilled") list.push(...value.data);
      return list;
    }, []);
  });
}
