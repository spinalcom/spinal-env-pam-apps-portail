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

export const ticketConfig = {
  buildingName: "Patrimoine IVV",
  steps: {
    closed: ["Archived", "Refusée", "Clôturée", "Fermé"],
  },
  workflowList: [
    "Ticket Mission",
    "Ticket Mamady",
    "Workflow test",
    "Demande d'intervention",
  ],
};

export const config: IConfig = {
  viewButtons: "base",
  title: "Ticket viewer",
  calculs: [
    calculTypes.Maximum,
    calculTypes.Minimum,
    calculTypes.Moyenne,
    calculTypes.Somme,
  ],
  source: { name: "endpoint", profileName: "", type: "controlPoint" },
  sprites: false,
  legend: "auto",
  regroupement: "",
};
