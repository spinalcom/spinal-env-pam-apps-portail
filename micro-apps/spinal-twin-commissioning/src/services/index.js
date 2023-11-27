import { HTTP } from "./http-constants";

export function prepareTree(tree, equipementName) {
  results = {};
  var floorTree = tree.children[0].children;
  floorTree.forEach(f => {
    results[f.name] = [];
    f.children.forEach(r => {
      r.children.forEach(e => {
        if (e.name.includes(equipementName)) {
          results[f.name].push(e.dynamicId);
        }
      })
    })
  })
  return results;
}

export async function getContextTree() {
    let availabilityArray = [0, 0, 0];
    let namingConventionArray = [0, 0, 0, 0];
    const buildingId = localStorage.getItem("idBuilding");
    let geographicContextTree = await HTTP.get(`/building/${buildingId}/geographicContext/tree`);
    let floorEquipements = prepareTree(geographicContextTree.data, 'VE_GTIE_GTB_GTB_MULTICAPTEUR');
    let result = await HTTP.get(`/building/${buildingId}/groupContext/list`);

    const commissioningDynamicId = result.data.find((t) => {
      return t.name == 'Analyse commissioning GTB';
    }).dynamicId;
    result = await HTTP.get(
      `/building/${buildingId}/groupContext/${commissioningDynamicId}/tree`
    );

    // TODO
    // Make it recursive
    result = result.data.children
      .find((t) => {
        return t.name == "Analyse";
      })
      .children.find((t) => {
        return t.name == "Multicapteurs";
      }).children;
    result = result.map((element) => {
      for (const key in floorEquipements) {
        if (floorEquipements[key].includes(element.dynamicId)) {
          return {dynamicId: element.dynamicId, name: element.name, floor: key};
        }
      }
      return { dynamicId: element.dynamicId, name: element.name };
    });
    let a;
    let floor;
    for (let index = 0; index < result.length; index++) {
      a = await (
        await HTTP.get(
          `/building/${buildingId}/node/${result[index].dynamicId}/control_endpoint_list`
        )
      ).data[0].endpoints;
      a.find((element) => {
        if (element.name == "Convention de nommage") {
          result[index]["naming"] = element.currentValue;
        }
      });

      a.find((element) => {
        if (element.name == "Taux de données exploitables") {
          result[index]["actionable"] = element.currentValue;
        }
      });
      a.find((element) => {
        if (element.name == "Taux de données en défaut reçues") {
          result[index]["default"] = element.currentValue;
        }
      });
      a.find((element) => {
        if (element.name == "Taux de disponibilité") {
          result[index]["availability"] = element.currentValue;
          if (typeof element.currentValue == "undefined") availabilityArray[1]++;
          else if (element.currentValue < 70) {
            availabilityArray[0]++;
          } else {
            availabilityArray[2]++;
          }
        }
      });
      a.find((element) => {
        if (element.name == "Monitorabilité") {
          // OK NOK CONVENTION DE NOMMAGE INCORRECTE DONNÉES NON REMONTÉES
          result[index]["monitorability"] = element.currentValue;
          if (element.currentValue && element.currentValue < 5) {
            result[index]["monitorability"] = "DONNÉES NON REMONTÉES";
            namingConventionArray[3]++;
          } else if (element.currentValue && element.currentValue < 10) {
            result[index]["monitorability"] = "CONVENTION DE NOMMAGE INCORRECTE";
            namingConventionArray[2]++;
          } else if (element.currentValue && element.currentValue < 20) {
            result[index]["monitorability"] = "NOK";
            namingConventionArray[1]++;
          } else if (element.currentValue) {
            result[index]["monitorability"] = "OK";
            namingConventionArray[0]++;
          }
        }
      });
    }
    result["availabilityArray"] = availabilityArray;
    result["namingConventionArray"] = namingConventionArray;
    return result;
  }