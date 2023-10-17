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
   entryPoint: EntryPoint;
   title: string;
   viewButtons: "base" | "advanced",
   calculs: calculTypes[];
   source: ISource;
   sprites: boolean;
   legend: ILegend;
   regroupement: "floors" | "rooms" | "groups";
}


export type EntryPoint = { context: string; group?: string;  category?: string} 


export const enum calculTypes {
   Maximum = "Maximum",
   Minimum = "Minimum",
   Moyenne = "Moyenne",
   Somme = "Somme"
}



export interface ISource {
   name: string;
   profileName?: string;
   type: "controlPoint" | "endpoint" | "attribute";
   objectType: "equipments" | "rooms";
   categoryName?: string;
   unit?: string;
}




interface ILegendValue {
   value: number;
   color: string;
}

interface ILegend {
   min: ILegendValue;
   median?: ILegendValue;
   max: ILegendValue;
}

export interface IButton {
   title: string;
   icon: string;
   isShownTypes?: string[]; 
   onclickEvent?: ActionTypes
}