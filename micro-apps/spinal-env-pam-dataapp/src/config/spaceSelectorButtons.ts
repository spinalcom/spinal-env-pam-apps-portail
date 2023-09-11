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

import { IButton } from "../interfaces/IConfig";

export const spaceSelectorButtons: IButton[] = [
   {
      title: "charger ce model uniquement",
      icon : "mdi-video-3d",
      onclickEvent: "load",
      isShownTypes: ["geographicFloor"]
   },
   {
      title: "charger ce model en plus",
      icon : "mdi-rotate-3d",
      onclickEvent: "load_plus",
      isShownTypes: ["geographicFloor"]
   },
   {
      title: "decharger ce model",
      icon : "mdi-video-3d-off",
      onclickEvent: "unload",
      isShownTypes: ["geographicFloor"]
   },
  {
      title: "Zoomer",
      icon : "mdi-fit-to-screen-outline",
      onclickEvent: "fitToView"
   },
  {
      title: "selectionner",
      icon : "mdi-selection",
      onclickEvent: "select"
   },
  {
      title: "isoler",
      icon : "mdi-plus",
      onclickEvent: "isolate"
   }
]