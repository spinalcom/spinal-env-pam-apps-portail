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
            label: 'Coût consommations globales',
            min: null,
            max: 3500,
            name: 'Coût consommations globales',
            color: '#14202c',
            unit: 'Eur',
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
            label: 'Coût énergie globale',
            min: null,
            max: 500,
            name: 'Coût énergie globale',
            color: '#E8D712',
            unit: 'Eur',
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
        {
            label: 'Coût eau globale',
            min: null,
            max: 2500,
            name: 'Coût eau globale',
            color: '#5444ae',
            unit: 'Eur',
            stackGroup: '01',

            title: 'd\'éclairage consommée',
            todayTitle: 'today',
            subtitle: 'par rapport a l\'énergie globale',
            totalSubtitle: 'TOTAL SUBTITLE',

            averageTitle: 'AVERAGE TEXT',
            averageSubtitle: '',

            totalTitle: 'TOTAL TEXT',
            todaySubtitle: 'today',

            root: false,
        },
        
    ],
    
    cards: ['total', 'average', 'today'], // ['total', 'average', 'today']
};

// "water": "Eau globale",
// "sanitary_water": "Eau sanitaire",
// "people_number": "Nombre de personnes",
// "energy": "Energie globale",
// "lighting": "Eclairage",
// "heating": "Chauffage"