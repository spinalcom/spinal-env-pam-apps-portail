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


module.exports = {
    title: 'STANDARD OCCUPATION',
    fileName: 'Affluence entree',
    unit: {
        default: false,
        left: {
            name: '%',
            shortName: '%',
            icon: 'mdi-percent', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        },
        right: {
            name: 'Personnes',
            shortName: 'Per',
            icon: 'mdi-account-multiple', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        }
    },
    calculs: ['Maximum', 'Minimum', 'Moyenne'],  // 'Maximum', 'Minimum', 'Moyenne', 'Somme'
    name: 'affluence_entree',
    controlEndpoint: 'affluence_entree',
    calendarLegend: 'La légende du calendrier',
    stripLegend: 'La légende de la longue bande',
    getFloors : true,
    source: [
        {
            title: 'Espace d\'accueil',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: "Taux d'occupation",
            profile: 'Position de travail',
            capacity: 500,
            max: 100,
            min: null,
            color: '#4287f5',
        },
        // {
        //     title: 'Salle d\'attente',
        //     type: 'controlEndpoint', // [controlEndpoint, endpoint]
        //     name: 'affluence_entree',
        //     profile: 'Ubigreen affluence',
        //     capacity: 100,
        //     max: 10,
        //     min: null,
        //     color: '#ad42f5',
        // },
        // {
        //     title: 'Parking / Garage',
        //     type: 'controlEndpoint', // [controlEndpoint, endpoint]
        //     name: 'affluence_entree',
        //     profile: 'Ubigreen affluence',
        //     capacity: 500,
        //     max: 100,
        //     min: null,
        //     color: '#f57e42',
        // },
        // {
        //     title: 'Salle de sport / Gymnase',
        //     type: 'controlEndpoint', // [controlEndpoint, endpoint]
        //     name: 'affluence_entree',
        //     profile: 'Ubigreen affluence',
        //     capacity: 500,
        //     max: 100,
        //     min: null,
        //     color: '#14202c',
        // },
        // {
        //     title: 'Cafétéria',
        //     type: 'controlEndpoint', // [controlEndpoint, endpoint]
        //     name: 'affluence_entree',
        //     profile: 'Ubigreen affluence',
        //     capacity: 500,
        //     max: 100,
        //     min: null,
        //     color: '#f54299',
        // }
    ],
};