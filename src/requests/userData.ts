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


import axios from "axios";
import { SERVER_BASE_URL } from ".";


export function getUserApps(profileId: string | null) {
    if (!profileId) throw new Error("no profileId found");

    return axios.get(`${SERVER_BASE_URL}/api/v1/pam/user_profile/get_authorized_apps/${profileId}`).then((result) => {
        return result.data;
    })
}

export function getUserBos(profileId: string | null) {
    if (!profileId) throw new Error("no profileId found");

    return axios.get(`${SERVER_BASE_URL}/api/v1/pam/user_profile/get_authorized_bos/${profileId}`).then((result) => {
        return result.data;
    })
}

export function getAppById(appId: string | null) {
    return axios.get(`${SERVER_BASE_URL}/api/v1/pam/get_app_by_id/${appId}`).then((result) => {
        return result.data;
    })
}