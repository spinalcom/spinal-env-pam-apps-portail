



import { SpinalAPI } from "./spinalAPI/SpinalAPI"
import { config } from '../../config'
import * as lodash from 'lodash'
import { store } from './store'
import { MutationTypes } from "./store/appDataStore/mutations";
import { IContext, ICategory, IGroup, ItemInGroup, ItemPositon } from "../interfaces/IGetAllBuildingsRes";



export async function getBuilding() {
  const buildingId = localStorage.getItem("idBuilding");
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId!, `/building/read`);
  const result = await spinalAPI.get(url);
  
  // const result = await HTTP.get(`building/read`);
  return result.data;
}

async function getReadStaticdetailsMultiple(buildingId: string, dynamicIds: number[]) {
  const spinalAPI = SpinalAPI.getInstance();
  const url = config.entryPoint.type === "equipement" ? `/equipment/read_static_details_multiple` : `/room/read_static_details_multiple`;
  const res = await sendListMultipleRequest(buildingId, dynamicIds, url)
  return res;
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
               
                  const value = {
                    dynamicId: attribute.dynamicId,
                    attribute: nameAttribut,
                  }
                  return value;
              }
          }
          return null; // Retourner null si aucune correspondance trouvée
      }).filter(Boolean); // Filtrer les valeurs nulles

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

export async function getData(buildingId: string){
  const context = await getContext(buildingId);
  const category = await getCategoryList(buildingId, context.dynamicId);
  const group = await getGroupList(buildingId, context.dynamicId, category.dynamicId);
  const groupItems = await getGroupItems(buildingId, context.dynamicId, category.dynamicId, group.dynamicId);
  return groupItems;
}

async function getContext(buildingId: string): Promise<IContext> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId, `/groupContext/list`);
  const res = await spinalAPI.get(url);
  const context = res.data.find((el) => el.name === config.entryPoint.context);
  return context;
}

async function getCategoryList(buildingId: string, contextId: number): Promise<ICategory>{
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId, `/groupeContext/${contextId}/category_list`);
  const res = await spinalAPI.get(url);
  const category = res.data.find((el) => el.name === config.entryPoint.category) ;
  return category as ICategory;
}


async function getGroupList(buildingId: string, contextId: number, categoryId: number) : Promise<IGroup> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId, `/groupeContext/${contextId}/category/${categoryId}/group_list`);
  const res = await spinalAPI.get(url);
  const group = res.data.find((el) => el.name === config.entryPoint.group);
  return group as IGroup;
}


async function getGroupItems(buildingId: string, contextId: number, categoryId: number, groupId: number): Promise<ItemInGroup[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = config.entryPoint.type === "equipement" ? `/equipementsGroup/${contextId}/category/${categoryId}/group/${groupId}/equipementList` : `/roomsGroup/${contextId}/category/${categoryId}/group/${groupId}/roomList`;
  const res = await spinalAPI.get(spinalAPI.createUrlWithPlatformId(buildingId, url));
  return res.data as ItemInGroup[];
}


export async function getDataInContextSpatial(buildingId: string, spatialName: string, spatialType: string) {
    const data = await getData(buildingId);
    let result: any = [];
      if(spatialType === "geographicBuilding") {
        const dynamicIds = data.map((el) => el.dynamicId);
        let itemPosition = await getPositionMultiple(buildingId, dynamicIds);
         itemPosition = itemPosition.filter((el) => el.info && el.info.building);
         result = itemPosition.map((el)=> {
          if(el.info.building.name === spatialName) {
            return el;
          }
          else {
            return null;
          }
        }).filter(Boolean);
      }
      else if(spatialType === "geographicFloor") {
        const dynamicIds = data.map((el) => el.dynamicId);
        let itemPosition = await getPositionMultiple(buildingId, dynamicIds);
       itemPosition = itemPosition.filter((el) => el.info && el.info.floor);
        result = itemPosition.map((el)=> {
          if(el.info.floor.name === spatialName) {
            return el;
          }
          else {
            return null;
          }
        }).filter(Boolean);
        
       }

       const dynamicIds = result.map((el) => el.dynamicId);
       const read = await getReadStaticdetailsMultiple(buildingId, dynamicIds);
        const sources = read.map((el : any) => {
          const findTypeattributeInsrc = config.sources.map((src) => {
            return src.type === 'attribute' ? src : null;
          }).filter(Boolean);
          const findTypeControlPointInsrc = config.sources.map((src) => {
            return src.type === 'controlPoint' ? src : null;
          }).filter(Boolean);
          const findTypeEquipementInsrc = config.sources.map((src) => {
            return src.type === 'endpoint' ? src : null;
          }).filter(Boolean);
          let src: any = [];
          if(findTypeattributeInsrc.length > 0 && el.attributsList) {
            const attributeList: any = [];
            for (const src of findTypeattributeInsrc) {
              const attribute = el.attributsList.find((attr: any) => attr.name === src?.categoryName);
              if(attribute && attribute.attributs) {
                const attributs = attribute.attributs.find((attr: any) => attr.label.toString().toLocaleLowerCase() === src?.name.toLocaleLowerCase());
                const attr = {
                  dynamicId: attributs.dynamicId,
                  name: attributs.label,
                  value: attributs.value ? attributs.value : "undefined",
                }
                attributeList.push(attr);
              }
            }
            src.push(...attributeList);
          }
          if(findTypeControlPointInsrc.length > 0 && el.controlEndpoint) {
            const controlPointList: any = [];
            for (const src of findTypeControlPointInsrc) {
              const controlPoint = el.controlEndpoint.find((ctl: any) => ctl.profileName === src?.profileName);
              if(controlPoint && controlPoint.endpoints) {
                const endpoints = controlPoint.endpoints.find((end: any) => end.name === src?.name);
                controlPointList.push(endpoints);
              }
            }
            src.push(...controlPointList);
          }
          if(findTypeEquipementInsrc.length > 0 && el.equipementsList) {
            const equipementList: any = [];
            for (const src of findTypeEquipementInsrc) {
              const equipement = el.equipementsList.find((eq: any) => eq.name === src?.name);
              if(equipement) {
                equipementList.push(equipement);
              }
            }
            src.push(...equipementList);
          }
          return  {
            dynamicId: el.dynamicId,
            name: el.name,
            type: el.type,
            staticId: el.id,
            info: el.info,
            sources: src,
          }
          
        } )

        const final = sources.map((el: any) => {
          const matchingRead = result.find((readEl: any) => readEl.dynamicId === el.dynamicId);
          return matchingRead ? { ...el, ...matchingRead } : el;
        });
        
        store.commit(MutationTypes.SET_DATA, final);
} 

async function getPositionMultiple(buildingId: string, dynamicIds: number[]): Promise<ItemPositon[]> {
  const spinalAPI = SpinalAPI.getInstance();
  
  const url = config.entryPoint.type === "equipement" ? `/equipment/get_position_multiple`: `/room/get_position_multiple`;
  const res = await sendListMultipleRequest(buildingId, dynamicIds, url);
  return res as ItemPositon[];
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

 

 export function parseRegex(value: any) {
  const match = value.match(/^\/(.*)\/([gimuy]*)$/);
  if(match) {
    const pattern = match[1].replace(/\\\\/g, "\\")
    const flags = match[2];
    const regex = new RegExp(pattern, flags);
    return regex;
  } 
  else {
    return new RegExp(value);
  }
 }