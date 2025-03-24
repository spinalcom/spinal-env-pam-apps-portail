



import { SpinalAPI } from "./spinalAPI/SpinalAPI"
import { config } from '../../config'
import * as lodash from 'lodash'
import { store } from './store'
import { MutationTypes } from "./store/appDataStore/mutations";



export async function getBuilding() {
  const buildingId = localStorage.getItem("idBuilding");
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId!, `/building/read`);
  const result = await spinalAPI.get(url);
  
  // const result = await HTTP.get(`building/read`);
  return result.data;
}
export async function getGroupEquipement(buildingId: string, floor: any) {
  try {
    const spinalAPI = SpinalAPI.getInstance();
    const dynamicId = floor?.dynamicId;
    
    if (!dynamicId) {
      console.error("Floor dynamicId is undefined");
      return [];
    }

    const url = spinalAPI.createUrlWithPlatformId(
      buildingId,
      `/floor/${dynamicId}/inventory`
    );

    const res = await spinalAPI.post(url, {
      context: config.entryPoint.context,
      category: config.entryPoint.category,
    });

    if (!res?.data || !Array.isArray(res.data)) {
      console.error("Invalid response data", res);
      return [];
    }

    const data = res.data.find((el) => el.name === config.entryPoint.group);

    if (!data || !Array.isArray(data.groupItems)) {
      return [];
    }
    
    const equipement = data.groupItems;
   const attributeList:any = await getAttributeListMultiple(buildingId, equipement.map((el) => el.dynamicId));   
    const attr = attributeList.attribut;
    const endpointList = await getControlpointList(buildingId, equipement);
    endpointList.map((el :any) => {
     el.endpoints ? el.endpoints : el.endpoints = [];
      const attr = attributeList.attribut.find((attr) => attr.dynamicId === el.dynamicId);
      if(attr) {
        const value : any = {
          dynamicId: attr.dynamicId,
          name: attr.attribute.label,
          currentValue: attr.attribute.value ? attr.attribute.value : "undefined",
        }
        el.endpoints.unshift(value);
      }

  
    })
        
    return equipement.map((el) => {
      const endpoint = endpointList.find((end) => end.dynamicId === el.dynamicId);
      const attr = attributeList.attribut.find((attr) => attr.dynamicId === el.dynamicId);
      if(endpoint && attr) {
        return {
          dynamicId: el.dynamicId,
          name: el.name,
          dbid: el.id,
          type: el.type,
          staticId: el.staticId,
          color: el.color,
          floorName: floor.name,
          floorId: floor.dynamicId,
          room: el.room ?? null,
          endpoints: endpoint.endpoints,
          attribute: attr.attribute,
        }
      }
      else {
        return {
          nameAttribute: 'undefined',
          valueAttribute: 'undefined',
          dynamicId: el.dynamicId,
          name: el.name,
          dbid: el.id,
          type: el.type,
          staticId: el.staticId,
          color: el.color,
          floorName: floor.name,
          floorId: floor.dynamicId,
          room: el.room ?? null, 
        }
      }
    });
  } catch (error) {
    console.error("Error in getGroupEquipement:", error);
    return [];
  }
}

export async function getAttributeListMultiple(buildingId: string, dynamicIds: number[]) {
  const urlatt = `node/attribute_list_multiple`;
  const attributeList = await sendListMultipleRequest(buildingId, dynamicIds, urlatt);  
  // Si aucun attribut n'est retourné, renvoyer un tableau vide 
  if (attributeList.length === 0) {
      return [];
  }
  
  let attribut: any = [];
 
  
  // Parcours des attributs récupérés
  for (const attribute of attributeList) {
      // On parcourt les catégories d'attributs
      const category = attribute.categoryAttributes.map((el: any) => {
        const sources = config.sources.find((src) => src.type === "attribute");
        
          if (el.name === sources?.categoryName) {
              // Vérification si 'a    console.log("data.groupItems", equipement );
              
              if (!el.attributs || !Array.isArray(el.attributs)) {
                return null;
                
              }
              
              
              // On cherche l'attribut avec le label spécifique
              
              const nameAttribut = el.attributs.find((attr: any) => attr.label.toString().toLowerCase() === sources?.name.toLocaleLowerCase());

              if (nameAttribut) {
                  // Vérifier si la valeur correspond à la convention de nommage
                  // if (config.attributs.conventionName.test(nameAttribut.value)) {
                  //     // Vérifier si l'élément est déjà vu (doublon)
                  //     if (seen.has(nameAttribut.value)) {
                  //         doublons.push(nameAttribut); // Ajouter aux doublons
                  //     } else {
                  //         // Sinon, ajouter la valeur au Set 'seen' pour éviter les doublons
                  //         seen.add(nameAttribut.value);
                  //     }
                  // }
                  // else {
                  //     // Si la valeur ne correspond pas à la convention de nommage, retourner null
                  //     wrongNaming++;
                  //      nameAttribut.value;
                  // }
                  const value = {
                    dynamicId: attribute.dynamicId,
                    attribute: nameAttribut,
                  }
                  return value;
              }
          }
          return null; // Retourner null si aucune correspondance trouvée
      }).filter(Boolean); // Filtrer les valeurs nulles

      // Si des catégories valides sont trouvées, les ajouter au tableau des attributs
      if (category.length > 0) {
          attribut.push(...category);
      }
  }
  
  return {attribut, attributList : attribut};
}


export async function getControlpointList(buildingId: string, item: any[]) {
  const spinalAPI = SpinalAPI.getInstance();
  const dynamicIds = item.map((el) => el.dynamicId);

  const url = `/node/control_endpoint_list_multiple`;
  const res: any = await sendListMultipleRequest(buildingId, dynamicIds, url);

  const type = "controlPoint";
  const sources = config.sources.filter(
    (src) => src.type.toLowerCase() === type.toLowerCase()
  );
  const data = item.map((el) => {
    let endpoints: any[] = [];

    for (const ctl of res) {
      for (const controlpoint of ctl) {
        if (controlpoint.dynamicId === el.dynamicId) {
          // Vérifier les correspondances avec `sources`
          for (const src of sources) {
            if (src.profileName === controlpoint.profileName) {
              // Récupérer tous les `endpoints` qui correspondent
              const matchingItems = controlpoint.endpoints
                .filter((match: any) => match.name === src.name); // Garde uniquement les endpoints qui matchent

              endpoints.push(...matchingItems);
            }
          }
        }
      }
    }

    return {
      ...el,
      endpoints: endpoints.length > 0 ? endpoints : undefined, // Éviter un tableau vide
    };
  });  
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
   const promises = chunked.map((ids) => spinalAPI.post<any>(url, ids));
   return Promise.allSettled(promises).then((result) => {
     return result.reduce((list, { status, value }) => {
       if (
         status === "fulfilled" &&
         (value.status == 200 || value.status == 206)
       )
         list.push(...value.data);
       return list;
     }, []);
   });
 }
 