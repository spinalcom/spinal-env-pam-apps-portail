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

import { getUserApps, getUserBos, getPortofolios } from "../requests/userData";

export const SET_USER_APPS = "SET_USER_APPS";
export const SET_USER_BOS = "SET_USER_BOS";
export const SET_USER_INFO = "SET_USER_INFO";
export const SET_AND_FORMAT_APPS = "SET_AND_FORMAT_APPS";
export const SET_SELECTED_APP = "SET_SELECTED_APP";
export const SET_PORTOFOLIOS = "SET_PORTOFOLIOS";


function classifyByCategory(apps: any[]): { name: string, id: string, apps: any[] }[] {
    const obj: { [key: string]: any } = {};
    apps.forEach(data => {
        const categoryId = data.categoryName;
        if (!obj[categoryId]) obj[categoryId] = { id: categoryId, name: data.categoryName, apps: [] };

        obj[categoryId].apps.push(data)
    });

    return Array.from(Object.values(obj));
}


function classifyByCategoryAndGroup(apps: any[]) {
    let categories = classifyByCategory(apps);
    console.log("categories", categories)
    const groups: any[] = [];
    const data = categories.map(({ name, id, apps }) => {
        let t: { [key: string]: any } = { name, id };

        apps.forEach(el => {
            const groupId = el.groupName
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

export const appDataStore = {
    namespaced: true,
    state: {
        portofolios: undefined,
        spaceSelected: "",
        appSelected: undefined,
        appsDisplayed: [],
        pamApps: [],
        bos: [],
        appsFormatted: undefined,
        userInfo: {},
        _privateData: { userInfoIsSet: false, appsIsSet: false }
    },
    mutations: {
        [SET_PORTOFOLIOS](state: any, playload) {
            state.portofolios = playload;
        },

        // [SET_USER_APPS](state: any, playload: any) {
        //     state.pamApps = Object.assign([], playload);
        //     const formatted = classifyByCategoryAndGroup(playload);
        //     appsFormattedMap.set(patrimoineSelectValue, formatted);
        //     if (state.spaceSelected === patrimoineSelectValue) {
        //         state.appsDisplayed = playload;
        //         state.appsFormatted = formatted;
        //         state._privateData.appsIsSet = true;
        //     }
        //     // state.appsFormatted = classifyByCategoryAndGroup(playload);
        // },
        // [SET_USER_BOS](state: any, playload: any) {
        //     state.bos = playload;
        // },

        [SET_USER_INFO](state: any, playload: any) {
            state.userInfo = playload;
            state._privateData.userInfoIsSet = true;
        },

        [SET_AND_FORMAT_APPS](state: any, { apps, appsFormatted }: any) {
            state.appsDisplayed = apps;
            state.appsFormatted = appsFormatted;
        },

        [SET_SELECTED_APP](state: any, playload: any) {
            state.appSelected = playload;
        }
    },
    actions: {
        async getPortofolios({ commit, dispatch, state }: any) {
            try {
                const profileId = await dispatch("getProfileId");
                const portofolios = await getPortofolios(profileId);
                commit(SET_PORTOFOLIOS, portofolios);
            } catch (error) {

            }
        },

        // async getApps({ commit, dispatch, state }: any) {
        //     try {
        //         if (state._privateData.appsIsSet) {
        //             if (!state.appsFormatted) {
        //                 commit(SET_USER_APPS, state.appsDisplayed);
        //             }
        //             return state.appsDisplayed;
        //         }
        //         const profileId = await dispatch("getProfileId");
        //         const apps = await getUserApps(profileId);
        //         commit(SET_USER_APPS, apps);
        //     } catch (error) {
        //         throw error;
        //     }
        // },

        // async getBos({ commit, dispatch }: any) {
        //     try {
        //         const profileId = await dispatch("getProfileId");
        //         const bos = await getUserBos(profileId);
        //         commit(SET_USER_BOS, bos);
        //     } catch (error) {
        //         throw error;
        //     }
        // },

        getProfileId() {
            if (localStorage.getItem("profileId")) return Promise.resolve(localStorage.getItem("profileId"));
            // send request
        },

        getUserInfo({ commit, state }: any) {
            if (state._privateData.userInfoIsSet) return state.userInfo;

            let userInfo = {}
            const storage = localStorage.getItem("user");
            if (storage) userInfo = JSON.parse(atob(storage));
            //send request;

            commit(SET_USER_INFO, userInfo)
            return userInfo;
        },

        selectSpace({ commit, state }: any, data: { portofolioId: string, buildingId: string }) {
            let apps = []
            const portofolio = state.portofolios.find(el => el.id === data.portofolioId);
            if (portofolio && !data.buildingId) {
                apps = portofolio.apps;
                state.spaceSelected = data.portofolioId;
            } else if (portofolio && data.buildingId) {
                const building = portofolio.buildings.find(el => el.id === data.buildingId);
                if (building) {
                    state.spaceSelected = data.buildingId;
                    apps = building.apps;
                }
            }

            let appsFormatted: any = [];
            if (appsFormattedMap.get(state.spaceSelected)) appsFormatted = appsFormattedMap.get(state.spaceSelected);
            else {
                appsFormatted = classifyByCategoryAndGroup(apps);
                appsFormattedMap.set(state.spaceSelected, appsFormatted);
            }

            commit(SET_AND_FORMAT_APPS, { apps, appsFormatted });


            // if (!spaceId) spaceId = patrimoineSelectValue;
            // let apps = [];
            // if (spaceId === patrimoineSelectValue) apps = state.pamApps;
            // else {
            //     const found = state.bos.find((el: any) => el.id == spaceId);
            //     if (found && found.apps) apps = found.apps;
            // }

            // state.spaceSelected = spaceId;

            // let appsFormatted: any = [];
            // if (appsFormattedMap.get(spaceId)) appsFormatted = appsFormattedMap.get(spaceId);
            // else {
            //     appsFormatted = classifyByCategoryAndGroup(apps);
            //     appsFormattedMap.set(spaceId, appsFormatted);
            // }

            // commit(SET_AND_FORMAT_APPS, { apps, appsFormatted });
        },
    }
}