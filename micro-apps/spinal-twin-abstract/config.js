/*
object = {
    title: "Consommation d'énergie",
    chart: 'bar',
    unit: 'Kw',
    compareBy: 'date', //part
    controlEndpoints: [
        {
            title
            label: 'Energie globale',
            name: 'Energie globale',
            color: '#14202c',
            unit: 'kWh',
            stackGroup: '0',
            title: 'd\'énergie consommés',
            todayTitle: 'today',
            averageTitle: 'Consommation moyenne',
            totalTitle: 'Consommation totale',
            subtitle: 'today',
            todaySubtitle: 'today ${date}',
            averageSubtitle: '',
            totalSubtitle: 'TOTAL SUBTITLE',
            root: true,
        },
    ]
}
*/
module.exports = {
    title: "CONSOMMATION D'ÉNERGIE",
    subtitle: "Description de la consomation d'energie",
    chart: 'bar',
    unit: 'kWh',
    calendarLegend: 'Le jour le plus où le batiment a le plus consommé est le',
    monthStripeLegend: 'Le mois où le bâtiment a le plus consommé est',
    compareBy: 'date', //part

    // Cards title and subtitle

    todaysCardTitle: 'Titre d\'aujourd\'hui',
    todaysCardSubtitle: 'Description d\'aujourd\'hui',

    averageCardTitle: 'Title de la card moyenne',
    averageCardSubtitle: 'Description de la card moyenne',

    totalCardTitle: 'Title de la card totale',
    totalCardSubtitle: 'Description de la card totale',

    controlEndpoints: [
        {
            label: 'Energie globale',
            name: 'Energie globale',
            color: '#14202c',
            unit: 'kWh',
            stackGroup: '0',

            title: 'd\'énergie consommés',
            subtitle: 'today',
            todayTitle: 'today',

            averageTitle: 'Consommation moyenne',
            averageSubtitle: '',

            totalTitle: 'Consommation totale',
            totalSubtitle: 'TOTAL SUBTITLE',
            root: true,
        },
        {
            label: 'Eclairage',
            name: 'Eclairage',
            color: '#E8D712',
            unit: 'kWh',
            stackGroup: '01',

            title: 'd\'éclairage consommée',
            todayTitle: 'today',
            subtitle: 'par rapport a l\'énergie globale',
            todaySubtitle: 'today',

            averageTitle: 'AVERAGE TEXT',
            averageSubtitle: '',

            totalTitle: 'TOTAL TEXT',
            totalSubtitle: 'TOTAL SUBTITLE',
            root: false,
        },
        // {
        //     label: 'Chauffage',
        //     name: 'Chauffage',
        //     color: '#5444ae',
        //     unit: 'kWh',
        //     stackGroup: '01',
        //     title: 'd\'éclairage consommée',
        //     todayTitle: 'today',
        //     averageTitle: 'AVERAGE TEXT',
        //     totalTitle: 'TOTAL TEXT',
        //     subtitle: 'par rapport a l\'énergie globale',
        //     todaySubtitle: 'today',
        //     averageSubtitle: '',
        //     totalSubtitle: 'TOTAL SUBTITLE',
        //     root: false,
        // },
        
    ],
    
    cards: ['total', 'average', 'today'], // ['total', 'average', 'today']
};

// "water": "Eau globale",
// "sanitary_water": "Eau sanitaire",
// "people_number": "Nombre de personnes",
// "energy": "Energie globale",
// "lighting": "Eclairage",
// "heating": "Chauffage"