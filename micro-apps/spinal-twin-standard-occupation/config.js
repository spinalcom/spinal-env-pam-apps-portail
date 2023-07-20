
module.exports = {
    title: 'Affluence entree',
    fileName: 'Affluence entree',
    unit: {
        default: false,
        left: {
            name: '%',
            icon: 'mdi-percent', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        },
        right: {
            name: 'Personnes',
            icon: 'mdi-account-multiple', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        }
    },
    calculs: ['Maximum', 'Minimum', 'Moyenne'],
    name: 'affluence_entree',
    controlEndpoint: 'affluence_entree',
    calendarLegend: 'La légende du calendrier',
    stripLegend: 'La légende de la longue bande',
    source: [
        {
            title: 'Espace d\'accueil',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
            color: '#4287f5',
        },
        {
            title: 'Salle d\'attente',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 100,
            max: 10,
            min: 0,
            color: '#ad42f5',
        },
        {
            title: 'Parking / Garage',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
            color: '#f57e42',
        },
        {
            title: 'Salle de sport / Gymnase',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
            color: '#14202c',
        },
        {
            title: 'Cafétéria',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
            color: '#f54299',
        }
    ],
};