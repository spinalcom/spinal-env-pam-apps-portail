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

import { IConfig, ITemporality, ProfilType } from "./interfaces/IConfig";

export const ticketConfig = {
  buildingName: "Patrimoine DEI",
  steps: {
    closed: ["Archived", "Refusée", "Clôturée"],
    refused: ["Refusée"],
    archived: ["Archived"],
  },
  workflowList: ["Ticket Mission", "Demande d'intervention"],
  application: [
    {
      name: "DESCRIPTION",
      id: "eyJuYW1lIjoiZGVzY3JpcHRpb24iLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImFiODgtZTU0NC1lZTAyLTE5NTNkN2IwYjQyIiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTc0MDQ5MzI0MzQyMCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzQwNDkzMjI4ODY2LCJpY29uIjoibWRpLW9yZGVyLWFscGhhYmV0aWNhbC1kZXNjZW5kaW5nIiwiZGVzY3JpcHRpb24iOiIiLCJ0YWdzIjpbXSwiY2F0ZWdvcnlOYW1lIjoiIiwiZ3JvdXBOYW1lIjoiIiwiaGFzVmlld2VyIjpmYWxzZSwicGFja2FnZU5hbWUiOiJzcGluYWwtYXBwLXZpZXdlci1kZXNjcmlwdGlvbiIsImlzRXh0ZXJuYWxBcHAiOmZhbHNlLCJsaW5rIjoiIiwiZG9jdW1lbnRhdGlvbkxpbmsiOiIiLCJyZWZlcmVuY2VzIjp7fSwicGFyZW50Ijp7InBvcnRvZm9saW9JZCI6IjM3ZGUtMDJiOC1lMThiLTE4NTA2NDNiNjhhIiwiYnVpbGRpbmdJZCI6IjM1ODMtMzVkMy1hMzNkLTE5MjFmMGQ0YjRiIn19",
      icon: "mdi-home-thermometer",
      description: "DESCRIPTION est une application",
      onglet: "Indicateur",
    },
  ],
};

export const config: IConfig = {
  viewButtons: "base",
  sprites: true,
  reloadInterval: 600000,
  // profilType: "Admin",
  profilType: ProfilType.Admin,
  viewerInfo: { roomRef: true, floorRef: true, equipments: "all" },
  temporality: [
    ITemporality.currentValue,
    ITemporality.day,
    ITemporality.week,
    ITemporality.month,
    ITemporality.year,
  ],
  // workflowList: ["Demande d'intervention"],
};
