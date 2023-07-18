
module.exports = {
    title: 'Affluence entree',
    fileName: 'Affluence entree',
    unit: {
        default: true,
        left: {
            name: '%',
            icon: 'mdi-percent', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        },
        right: {
            name: 'Personnes',
            icon: 'mdi-account-multiple', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        }
    },
    calculs: ['mean', 'max', 'min', 'sum'], // todo: object
    name: 'affluence_entree',
    controlEndpoint: 'affluence_entree',
    source: [
        {
            title: '',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            Name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
        },
        {
            title: '',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            Name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
        },
        {
            title: '',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            Name: 'affluence_entree',
            profile: 'Ubigreen affluence',
            capacity: 500,
            max: 100,
            min: 0,
        }
    ],
};