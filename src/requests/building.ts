import axios from "axios";
import { SERVER_BASE_URL } from ".";

const endpoint = "/api/v1/pam";
const host = (SERVER_BASE_URL || "").replace(`/\/$/`, el => "");
const baseURL = host.match(new RegExp(endpoint)) ? host : host + endpoint;


export const buildingIdToInfo = {};
export const buildingIdToControlEndpoints = {};

// const headers = {
// "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJuYW1lIjoiYWRtaW4iLCJ0eXBlIjoiQURNSU4iLCJpZCI6IjY5OGQtZTExMC1kOWFhLTE5N2FkMWFhZDllIiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTc2MTA0NzgyODQ0NSwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzUwOTU1ODk2MjIyLCJ1c2VyTmFtZSI6ImFkbWluIiwidXNlclR5cGUiOiJBRE1JTiJ9LCJ1c2VySWQiOiI2OThkLWUxMTAtZDlhYS0xOTdhZDFhYWQ5ZSIsInByb2ZpbGUiOnsicHJvZmlsZUlkIjoiZjQyZS0wMzdlLWViNjItMTk3YWQxYWFkNDkifSwiaWF0IjoxNzYxMTQwODIwLCJleHAiOjE3NjE3NDU2MjB9.I0Hlz8kotCAO2PtfdAbQynpgORa_xEbdFUVj06jSiJs`,
// }


export function generateBuildingUrl(buildingId: string) {
    return axios.post(`${baseURL}/generate_url_to_bos/${buildingId}`).then((result) => {
        return result.data;
    });
}


export function getBuildingDynamicId(buildingId: string) {

    if (buildingIdToInfo[buildingId]) return Promise.resolve(buildingIdToInfo[buildingId].dynamicId);

    return axios.get(`${host}/api/v2/building/${buildingId}/building/read`)
        .then((result) => {
            const { data } = result;
            if (data.dynamicId) {
                const response = { ...data, buildingId };
                buildingIdToInfo[buildingId] = response;
                return response;
            }
        }).catch((err) => {
            console.warn(err);
        });
}


export function getBuildingControlEndpointsList(building: { name: string; dynamicId: string; buildingId: string }, profileName: string) {

    if (buildingIdToControlEndpoints[building.buildingId]) {
        return Promise.resolve(buildingIdToControlEndpoints[building.buildingId]);
    }

    return axios.get(`${host}/api/v2/building/${building.buildingId}/node/${building.dynamicId}/control_endpoint_list`)
        .then((result) => {
            const { data: controlList } = result;
            const profile = controlList.find(el => el.profileName === profileName);
            if (profile && profile.endpoints.length > 0) {
                const result = {
                    buildingId: building.buildingId,
                    builddingName: building.name,
                    dynamicId: building.dynamicId,
                    controlPoints: profile.endpoints,
                    profile
                };

                buildingIdToControlEndpoints[building.buildingId] = result;
                return result;
            }
        }).catch((err) => {
            console.warn(err);
        });
}


export async function goToBosConfigPortail(buildingId: string) {
    try {
        // const buildingId = item?.buildingId;
        if (!buildingId) {
            alert("No building associated with this item");
            return;
        }

        const { url } = await generateBuildingUrl(buildingId);
        if (url) window.open(url, "_blank");
    } catch (error) {
        alert("Error while generating building url");
    }
}


