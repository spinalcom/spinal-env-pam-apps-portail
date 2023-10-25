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

import { IConfig, calculTypes } from "./interfaces/IConfig";

export const config: IConfig = {
   entryPoint: { context : "Gestion des équipements", category : "Typologie", group: "Multicapteurs" },
   viewButtons: "base",
   title: "Le titre de mon app",
   calculs : [calculTypes.Maximum, calculTypes.Minimum, calculTypes.Moyenne, calculTypes.Somme],
   source: { name: "Température", profileName: "Multicapteurs", type: "controlPoint", objectType: "equipments", unit : "°C" },
   sprites: true,
   legend: {
      min: { value: 15, color: "#0074FF" },
      median: { value: 27.5, color: "#FFFF00" },
      max: {value: 40, color: "#FF004B"}
   },
   regroupement: "Typologie"
}