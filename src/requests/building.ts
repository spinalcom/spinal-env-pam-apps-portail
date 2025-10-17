import axios from "axios";
import { SERVER_BASE_URL } from ".";

const endpoint = "/api/v1/pam";
const host = (SERVER_BASE_URL || "").replace(`/\/$/`, el => "");
const baseURL = host.match(new RegExp(endpoint)) ? host : host + endpoint;

export function generateBuildingUrl(buildingId: string) {
    return axios.post(`${baseURL}/generate_url_to_bos/${buildingId}`).then((result) => {
        return result.data;
    });
}