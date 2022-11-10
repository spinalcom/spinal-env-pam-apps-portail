/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import { HTTP, BOS_HTTP_REQUEST } from "./http-constants";
import { IBuilding } from "../interfaces/IBuilding";
import { IPortofolioCreation } from "../interfaces/IPortofolioCreation";


///////////////////////////////////////////////////
//                  PORTOFOLIO                   //
///////////////////////////////////////////////////

export function createPortofolioRequest(data: IPortofolioCreation) {
    return HTTP.post("/add_portofolio", data);
}


export function getAllportofolioRequest() {
    return HTTP.get("/get_all_portofolios_details");
}

export function removePortofolioRequest(id: string) {
    return HTTP.delete(`/remove_portofolio/${id}`);
}

export function editPortofolioRequest(id: string, data: any) {
    return HTTP.put(`/update_portofolio/${id}`, data);
}


///////////////////////////////////////////////////
//                  BUILDINGS                    //
///////////////////////////////////////////////////

export function addBuildingToPortofolioRequest(portofolioId: string, building: IBuilding) {
    return HTTP.post(`/add_building_to_portofolio/${portofolioId}`, building);
}

export function editBuildingRequest(buildingId: string, newInfo: any) {
    return HTTP.put(`/edit_building/${buildingId}`, newInfo);
}

export function deleteBuildingRequest(buildingId: string) {
    return HTTP.delete(`/delete_building/${buildingId}`)
}


///////////////////////////////////////////////////
//                  APPS                         //
///////////////////////////////////////////////////


export function getPortofolioAppsRequest() {
    return HTTP.get("/get_all_portofolio_apps");
}

export function getBuildingAppsRequest() {
    return HTTP.get("/get_all_building_apps");
}


export function getPortofolioApisRequest() {
    return HTTP.get("/get_all_portofolio_api_route");
}

export function getBuildingApisRequest() {
    return HTTP.get("/get_all_bos_api_route");
}