import { IConfig, ProfilType } from "./interfaces/IConfig";

export const config: IConfig = {
  viewButtons: "base",
  sprites: true,
  reloadInterval: 600000,
  profilType: ProfilType.Admin,
  viewerInfo: { roomRef: true, floorRef: true, equipments: "all" },
  ticketConfig: {
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
    targetAttributes: true,
    attributesByType: {
      equipment: {
        Spatial: ["XYZ center", "name", ""],
        default: ["description", "priority"],
      },
      room: {
        Spatial: ["area", "volume", "level"],
      },
      floor: {},
      building: {},
      ticket: { default: ["user", "priority"] },
    },
  },
};
