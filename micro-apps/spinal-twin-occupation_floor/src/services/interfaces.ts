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

type typeOfEndpoint = 'controlEndpoint' | 'endpoint';


export interface IConfig {
   title?: string,
    fileName?: string,
    unit: {
        default: boolean,
        left?: {
            name?: string,
            shortName?: string,
            icon?: string, // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        },
        right?: {
            name?: string,
            shortName?: string,
            icon?: string, // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        }
    },
    calculs?: string[],  // 'Maximum', 'Minimum', 'Moyenne', 'Somme'
    name?: string,
    controlEndpoint?: string,
    calendarLegend?: string,
    stripLegend?: string,
    getFloors? : boolean,
   source: ISource[];
} 


export interface ISource {
   title?: string;
   type: typeOfEndpoint;
   name: string;
   profile?: string;
   capacity?: number | string;
   max? : number | string;
   min? : number | string;
   color? : string;
}