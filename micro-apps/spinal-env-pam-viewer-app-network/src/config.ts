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

import { IConfig, ITemporality, ISource } from "./interfaces/IConfig";

export const config: IConfig = {

  viewButtons: "base",
  sprites: false,
  viewerInfo: { roomRef: true, floorRef: true, equipments: "all" },
  temporality: [ITemporality.currentValue, ITemporality.day, ITemporality.week, ITemporality.month, ITemporality.year],
  imageMapping: {
    Luminaire: require("./components/viewer/assets/Luminaire.png"),
    Automate: require("./components/viewer/assets/Automate.png"),
    Multicapteurs: require("./components/viewer/assets/Multicapteurs.png"),
    "Ventilo-Convecteur": require("./components/viewer/assets/Climatiseur.png"),
    Default: require("./components/viewer/assets/default.png"),
  },
  typologiesSource: { context: "Gestion des équipements", category: "Typologie" },
  source: [
    {
      name: "Présence",
      type: "controlPoint",
      objectType: "equipments",
    },
  ],
  // application: [
  //   {
  //     name: "Voir les données Insight",
  //     id: "eyJuYW1lIjoiSW5zaWdodHMiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImIwZTEtNzI3NS02YWNhLTE4ZjJlMjE1NmE4IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxNDQ2NTk0NzM4MCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0NDY1ODg3OTEyLCJpY29uIjoibWRpLWN1cnRhaW5zLWNsb3NlZCIsImRlc2NyaXB0aW9uIjoiSU5zaWdodHMiLCJ0YWdzIjpbIkluc2lnaHRzIl0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0taW5zaWdodHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiNTkzMi02MDg2LTllMWEtMTg1MDY0Nzg0NjAifX0",
  //     profileName: "KPI USI",
  //     type: "controlEndpoint",
  //     unit: "nbr de ctrlpts"
  //   },],
};