
module.exports = {
    title: "Bilan énergétique du bâtiment",
    fileName: 'Bilan-energie',
    unit: {
        default: false,
        left: {
            name: 'kWh',
            shortName: 'kWh',
            icon: 'mdi-lightning-bolt', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        },
        right: {
            name: 'Personnes',
            shortName: 'kWh/m²',
            icon: 'mdi-lightning-bolt', // visit this link to search for icons that work with this project https://v2.vuetifyjs.com/en/features/icon-fonts/#material-design-icons
        }
    },
    selectTitle: 'Espace sélectionné',
    calculs: ['Maximum', 'Minimum', 'Moyenne', 'Somme'],  // 'Maximum', 'Minimum', 'Moyenne', 'Somme'
    name: 'affluence_entree',
    controlEndpoint: 'affluence_entree',
    calendarLegend: 'Le jour où le bâtiment a le plus consommé est le ',
    stripLegend: 'Le mois où le bâtiment a le plus consommé est ',

    source: [
        {
            title: 'Energie globale',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'Energie globale',
            profile: 'KPI',
            capacity: 1,
            max: null,
            min: null,
            color: '#14202C',
        },
        {
            title: 'CVC',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'CVC',
            profile: 'KPI',
            capacity: 1,
            max: null,
            min: null,
            color: '#5444AE',
        },
        {
            title: 'Eclairage',
            type: 'controlEndpoint', // [controlEndpoint, endpoint]
            name: 'Eclairage',
            profile: 'KPI',
            capacity: 1,
            max: null,
            min: null,
            color: '#E8D712',
        },
    ],
    weekmap: {
        colors: null, // ['#E8E2FB', '#E6BEF3', '#E396EA', '#E27CE5', '#DF4FDB', '#D13ACA', '#AF2EA6', '#97258D', '#741968', '#500C43']
        min: null,
        max: null,
    },
    timeRanges: [
        {
            name: '24 Heures',
            intervals: [
                {
                    start: '00:00',
                    end: '23:59',
                }
            ]
        },
        {
            name: 'Matinée',
            intervals: [
                {
                    start: '09:00',
                    end: '12:00',
                }
            ]
        },
        {
            name: 'Heures de travail',
            intervals: [
                {
                    start: '08:00',
                    end: '12:00',
                },
                {
                    start: '14:00',
                    end: '18:00',
                }
            ]
        },
        {
            name: 'Pauses',
            intervals: [
                {
                    start: '10:00',
                    end: '10:15',
                },
                {
                    start: '12:00',
                    end: '13:59'
                },
                {
                    start: '16:00',
                    end: '16:15',
                }
            ]
        },
        {
            name: 'Heures non travaillées',
            intervals: [
                {
                    start: '00:00',
                    end: '06:59',
                },
                {
                    start: '19:00',
                    end: '23:59',
                }
            ]
        },
        {
            name: '10h - 12h',
            intervals: [
                {
                    start: '10:00',
                    end: '11:59',
                }
            ]
        },
        {
            name: '10h - 12h',
            intervals: [
                {
                    start: '10:00',
                    end: '11:59',
                }
            ]
        }
    ]
};