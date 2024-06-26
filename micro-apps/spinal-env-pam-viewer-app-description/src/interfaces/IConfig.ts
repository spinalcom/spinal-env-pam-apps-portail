/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import { ActionTypes } from "./vuexStoreTypes";

export interface IConfig {
	viewButtons: "base" | "advanced";
	viewerInfo: { roomRef: boolean; floorRef: boolean; equipments: "all" | "groupItem" | "none" };
	sprites: boolean;
	temporality: ITemporality[];
	application?: IApplication[];
	inventory: string;
	profileName: string;
	profileNameRoom: string;
	categorieAttributRoom: string;
	batiment: { profileNameControlePts: string, profileNameAttribut: string }
	floor: { profileNameControlePts: string, profileNameAttribut: string }
	room: { profileNameControlePts: string, profileNameAttribut: string }
}

export const enum ITemporality {
	currentValue = "Valeur courante",
	day = "journée",
	week = "Semaine",
	month = "Mois",
	year = "Année",
}

export interface IApplication {
	name: string;
	id: string;
	type: string;
	targetValue?: any;
	profileName?: string;
	unit?: string
}
