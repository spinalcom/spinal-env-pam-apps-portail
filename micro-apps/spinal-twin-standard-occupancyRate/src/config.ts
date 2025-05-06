import moment from 'moment';
import 'moment/locale/fr';
import { ApiEndpoints, EntryPoint, ChartsConfig } from './components/interfaces/configTypes';
import { apiEndpoints } from './configConstants'; 
import { temporalities } from './configConstants'; 


moment.locale('fr');


 // Configuration principale DEI
export const config = {
  title: "OCCUPATION EN TEMPS RÉEL",
  chart: '%',
  subtitle: '',

  entryPoints: <EntryPoint[]><unknown>[
    {
      name: 'DEI',
      type: 'geographicBuilding',
      source: [
        {
          profileName: 'hassan',
          name: "taux d'occupation",
          type: 'continue',
          label: "Taux d'occupation du bâtiment",
          backgroundColor: '#14202C',
          borderColor: '#14202C',
          globalDisplay: true,
          byFloorDisplay: true,
          displayX1:true,
        },
      ],
    },
    {
      name: "Gestion des espaces",
      type: 'geographicRoomGroupContext',
      category: 'Typologie',
      group: 'Salle de réunion',
      source: [
        {
          profileName: 'Occupation',
          name: "Taux d'occupation",
          type: 'continue',
          label: "Taux d'occupation des salles de réunion",
          backgroundColor: '#1C5791',
          globalDisplay: true, 
          byFloorDisplay: true,
          displayX1:false,
        },
      ],
    },
    {
      name: "Gestion des équipements",
      type: 'BIMObjectGroupContext',
      category: 'Typologie',
      group: 'Positions de travail',
      source: [
        {
          profileName: 'hassan',
          name: "Taux d'occupation",
          type: 'continue',
          label: "Taux d'occupation des positions de travail",
          backgroundColor: '#418FDD',
          globalDisplay: true,
          byFloorDisplay: true,
          displayX1:false,

        },
      ],
    },
    
  ],
  labels: {
    downloadFileName: "Taux d'occupation",
  },
};
 
 //config pour la pré PROD
/* 
  entryPoints: <EntryPoint[]>[
        
        {
      name: 'Contexte Pièce Capteur',
      category: 'Ubigreen',
      group: 'All',
      type: 'geographicRoomGroupContext',
      source: [
          {
              profileName: 'Ubigreen',
              name: "Ubigreen",
              type: 'continue',
              label: "Taux d'occupation du bâtiment",
              backgroundColor: '#14202C',
              borderColor: '#14202C',
              globalDisplay: true,
              byFloorDisplay: false,
              displayX1:true,
          }
      ]
  },
  {
    name: 'Contexte équipement capteur',
      category: 'Ubigreen',
      group: 'All',
      type: 'BIMObjectGroupContext',
      source: [
          {
              profileName: 'Ubigreen',
              name: "Ubigreen",
              type: 'continue',
              label: "Taux d'occupation des positions de travail",
              backgroundColor: '#418FDD',
              globalDisplay: true,
              byFloorDisplay: true,
              displayX1:true,

          }
      ]
  },
  {
      name: "B1",
      type: 'geographicBuilding',
      source: [
          {
              profileName: 'Ubigreen affluence',
              name: "Taux d'occupation Bâtiment",
              type: 'continue',
              label: "Taux d'occupation du bâtiment",
              backgroundColor: '#14202C',
              borderColor: '#14202C',
              globalDisplay: true,
              byFloorDisplay: false,
              displayX1:true,
          }
      ]
  },
        
    ],
};  */  