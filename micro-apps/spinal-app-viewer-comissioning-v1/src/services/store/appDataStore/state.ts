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

import type { IEquipmentItem, IZoneItem } from "../../../../../../global-components/SpaceSelector";
import type { IViewInfoItemRes } from "../../spinalAPI/GeographicContext/getViewInfo";
import type { IGetAllBuildingsRes } from "../../../interfaces/IGetAllBuildingsRes";
import { defaultTemporalitySelected, defaultZoneSelected } from "./utils/defaultZoneSelected";
import { INodeItemTree } from "../../../interfaces/INodeItem";
import { title } from "process";
import { IDynamicHeader, IRegexFilter } from "micro-apps/spinal-app-viewer-comissioning-v1/src/interfaces/IDynamicHeader";

export type StateAppData = typeof state;
export const state = {
	buildings: [] as IGetAllBuildingsRes[],
	zoneSelected: defaultZoneSelected(),
	lastLoadedZone: defaultZoneSelected(),
	temporalitySelected: defaultTemporalitySelected(),
	floors: {} as Record<string, IZoneItem[]>,
	rooms: {} as Record<number, IZoneItem[]>,
	roomBimObj: {} as Record<number, IEquipmentItem[]>,
	buildingInfo: {} as Record<number, IViewInfoItemRes[]>,
	viewerStartedList: {} as { [key: string]: string },
	itemSelected: undefined,
	dataVizExtn: undefined,
	data: undefined as any,
	dlData: undefined as any,
	attr: undefined as any,
	dl_data_option: true as boolean,
	user_selection_list: {} as any,

	// Dynamic list of categories, contexts, groups and types
	type_list: '' as string,
	title_list: '' as string,
	showForm: true as boolean,
	attributList: [] as any[],	
	user_selected: {
		cat: null,
		ctx: null,
		grp: null,
		type: '' as string,
	},


	// Configuration de la regex pour le filtre
	regex_filter : {} as IRegexFilter,


	// Dynamic header
	dynamicHeader: [] as IDynamicHeader[],

	loading : false as boolean,
	loadingCount : 0 as number,
	loadingText : 'Chargement ...' as string,
	inventory : [] as any

};
