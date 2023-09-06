
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
    // source: [
    //     {
    //         title: 'Taux d\'occupation Bâtiment',
    //         type: 'controlEndpoint', // [controlEndpoint, endpoint]
    //         name: 'Taux d\'occupation Bâtiment',
    //         profile: 'Ubigreen affluence',
    //         capacity: 500,
    //         max: 100,
    //         min: null,
    //         color: '#4287f5',
    //     },
    //     {
    //         title: 'Taux d\'occupation Cafétériat',
    //         type: 'controlEndpoint', // [controlEndpoint, endpoint]
    //         name: 'Taux d\'occupation Cafétériat',
    //         profile: 'Ubigreen affluence',
    //         capacity: 100,
    //         max: 10,
    //         min: null,
    //         color: '#ad42f5',
    //     },
    //     {
    //         title: 'Taux d\'occupation Auditorium',
    //         type: 'controlEndpoint', // [controlEndpoint, endpoint]
    //         name: 'Taux d\'occupation Auditorium',
    //         profile: 'Ubigreen affluence',
    //         capacity: 500,
    //         max: 100,
    //         min: null,
    //         color: '#f57e42',
    //     },
    //     {
    //         title: 'Taux d\'occupation RIE',
    //         type: 'controlEndpoint', // [controlEndpoint, endpoint]
    //         name: 'Taux d\'occupation RIE',
    //         profile: 'Ubigreen affluence',
    //         capacity: 500,
    //         max: 100,
    //         min: null,
    //         color: '#14202c',
    //     },
    //     {
    //         title: 'Taux d\'occupation',
    //         type: 'controlEndpoint', // [controlEndpoint, endpoint]
    //         name: 'Taux d\'occupation',
    //         profile: 'Position de travail',
    //         capacity: 500,
    //         max: 100,
    //         min: null,
    //         color: '#f54299',
    //     }
    // ],
    source: [
        {
            title: 'Energie globale',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'Energie globale',
            profile: 'KPI',
            capacity: 500,
            max: 100,
            min: null,
            color: '#4287f5',
        },
    ],
    weekmap: {
        colors: ['#E8E2FB', '#E6BEF3', '#E396EA', '#E27CE5', '#DF4FDB', '#D13ACA', '#AF2EA6', '#97258D', '#741968', '#500C43'],
        min: null,
        max: null,
    },

};