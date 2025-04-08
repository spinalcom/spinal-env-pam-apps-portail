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

import { ChartData } from "chart.js";
import { Building, Floor, Room, Equipment } from "micro-apps/spinal-twin-standard-occupancyRate/src/components/interfaces/types";



export type StateAppData = typeof state;
export const state = {
  // Données des bâtiments
  buildings: [] as Building[], // Liste des bâtiments
  selectedBuilding: null as Building | null, // Bâtiment sélectionné

  // Données des étages
  floors: {} as Record<string, Floor[]>, // Étages par bâtiment

  // Données des salles
  rooms: {} as Record<string, Room[]>, // Salles par étage

  // Données des équipements
  equipments: {} as Record<string, Equipment[]>, // Équipements par étage

  // Données des graphiques
  chartData: {
    labels: [] as string[],
    datasets: [] as ChartData[],
  },

  // Plage horaire sélectionnée
  startTime: '00:00',
  endTime: '23:59',
};


