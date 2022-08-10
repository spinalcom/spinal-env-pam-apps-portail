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

import { getUserApps, getUserBos } from "../requests/userData";

export const SET_USER_APPS = "SET_USER_APPS";
export const SET_USER_BOS = "SET_USER_BOS";
export const SET_USER_INFO = "SET_USER_INFO";
export const SET_AND_FORMAT_APPS = "SET_AND_FORMAT_APPS";


function classifyByCategory(apps: any[]): { name: string, id: string, apps: any[] }[] {
    const obj: { [key: string]: any } = {};
    apps.forEach(data => {
        const categoryId = data.categoryId;
        if (!obj[categoryId]) obj[categoryId] = { id: categoryId, name: data.categoryName, apps: [] };

        obj[categoryId].apps.push(data)
    });

    return Array.from(Object.values(obj));
}


function classifyByCategoryAndGroup(apps: any[]) {
    let categories = classifyByCategory(apps);
    const groups: any[] = [];
    const data = categories.map(({ name, id, apps }) => {
        let t: { [key: string]: any } = { name, id };

        apps.forEach(el => {
            const groupId = el.groupId
            if (!t[groupId]) {
                t[groupId] = [];
                groups.push({ name: el.groupName, id: groupId })
            }

            t[groupId].push(el);
        })

        return t
    })

    return { groups, data }
}

const appsFormattedMap = new Map();
const patrimoineSelectValue = "patrimoine";

export const userDataStore = {
    namespaced: true,
    state: { spaceSelected: patrimoineSelectValue, appsDisplayed: [], pamApps: [], bos: [], appsFormatted: {}, userInfo: {} },
    mutations: {
        [SET_USER_APPS](state: any, playload: any) {
            state.pamApps = Object.assign([], playload);
            const formatted = classifyByCategoryAndGroup(playload);
            appsFormattedMap.set(patrimoineSelectValue, formatted);
            if (state.spaceSelected === patrimoineSelectValue) {
                state.appsDisplayed = playload;
                state.appsFormatted = formatted;
            }
            // state.appsFormatted = classifyByCategoryAndGroup(playload);
        },
        [SET_USER_BOS](state: any, playload: any) {
            state.bos = playload;
        },

        [SET_USER_INFO](state: any, playload: any) {
            state.userInfo = playload;
        },

        [SET_AND_FORMAT_APPS](state: any, { apps, appsFormatted }: any) {
            state.appsDisplayed = apps;
            state.appsFormatted = appsFormatted;
        }
    },
    actions: {
        async getApps({ commit }: any) {
            try {
                const profileId = localStorage.getItem("profileId");
                const apps = await getUserApps(profileId);
                commit(SET_USER_APPS, apps);
            } catch (error) {
                throw error;
            }
        },

        async getBos({ commit }: any) {
            try {
                const profileId = localStorage.getItem("profileId");
                const bos = await getUserBos(profileId);
                commit(SET_USER_BOS, bos);
            } catch (error) {
                throw error;
            }
        },

        getProfileId() {
            if (localStorage.getItem("profileId")) return Promise.resolve(localStorage.getItem("profileId"));
            // send request
        },

        getUserInfo({ commit }: any) {
            let userInfo = {}
            const storage = localStorage.getItem("user");
            if (storage) userInfo = JSON.parse(atob(storage));
            //send request;

            commit(SET_USER_INFO, userInfo)
            return userInfo;
        },

        selectSpace({ commit, state }: any, spaceId: string) {
            if (!spaceId) spaceId = patrimoineSelectValue;
            let apps = [];
            if (spaceId === patrimoineSelectValue) apps = state.pamApps;
            else {
                const found = state.bos.find((el: any) => el.id == spaceId);
                if (found && found.apps) apps = found.apps;
            }

            state.spaceSelected = spaceId;

            let appsFormatted: any = [];
            if (appsFormattedMap.get(spaceId)) appsFormatted = appsFormattedMap.get(spaceId);
            else {
                appsFormatted = classifyByCategoryAndGroup(apps);
                appsFormattedMap.set(spaceId, appsFormatted);
            }

            commit(SET_AND_FORMAT_APPS, { apps, appsFormatted });
        }
    }
}