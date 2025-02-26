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
export default config = {
    chart: 'bar',
    unit: 'kWh',
    calendarLegend: 'Le jour le plus où le batiment a le plus consommé est le',
    monthStripeLegend: 'Le mois où le bâtiment a le plus consommé est',
    compareBy: 'date', //part

    // Cards title and subtitle

    todaysCardTitle: 'Title de la card moyenne',
    todaysCardSubtitle: 'Description de la card moyenne',

    averageCardTitle: 'Titre de la card consommation au m²',
    averageCardSubtitle: 'Description de la consommation au m²',

    totalCardTitle: 'Title de la card totale',
    totalCardSubtitle: 'Description de la card totale',

    controlEndpoints: [
        {
            title: "CONSOMMATION D'ÉNERGIE GLOBALE",
            subtitle: "Description de la consomation d'energie",
            label: 'Energie globale',
            min: null,
            max: 3500,
            name: 'Energie globale',
            color: '#14202c',
            unit: 'kWh',
            stackGroup: '0',
            source: {
                building : {
                    profileName: 'KPI USI',
                    name: 'Energie globale',
                },
                floor: {
                    profileName: 'KPI USI',
                    name: 'Energie globale',
                },
            },
           

            averageTitle: 'Consommation moyenne',
            averageSubtitle: '',

            totalTitle: 'Consommation totale',
            totalSubtitle: 'Par rapport à la période précédente',
            root: true,
        },
        {
            title: "CONSOMMATION D'ÉCLAIRAGE",
            subtitle: "Description de la consomation d'éclairage",
            label: 'Éclairage',
            min: null,
            max: 3500,
            name: '"Eclairage"',
            color: '#FFFF00',
            unit: 'kWh',
            stackGroup: '0',
            source: {
                building : {
                    profileName: 'KPI USI',
                    name: 'Eclairage',
                },
                floor: {
                    profileName: 'KPI USI',
                    name: 'Eclairage',
                },
            },
            averageTitle: 'Consommation moyenne',
            averageSubtitle: '',

            totalTitle: 'Consommation totale',
            totalSubtitle: 'Par rapport à la période précédente',
            root: true,
        },
        {
            title: "CONSOMMATION D'EAU",
            subtitle: "Description de la consomation d'eau globale",
            label: 'Eau globale',
            min: null,
            max: 3500,
            name: 'Eau globale',
            color: '#0000FF',
            unit: 'L',
            stackGroup: '0',
            source: {
                building : {
                    profileName: 'KPI USI',
                    name: 'Eau globale',
                },
                floor: {
                    profileName: 'KPI USI',
                    name: 'Eau sanitaire',
                },
            },
            todayTitle: 'today',

            averageTitle: 'Consommation moyenne',
            averageSubtitle: '',
            totalTitle: 'Consommation totale',
            totalSubtitle: 'Par rapport à la période précédente',
            root: true,
        }  
    ],
    
    cards: ['total', 'average', 'today'], // ['total', 'average', 'today']
};

// "water": "Eau globale",
// "sanitary_water": "Eau sanitaire",
// "people_number": "Nombre de personnes",
// "energy": "Energie globale",
// "lighting": "Eclairage",
// "heating": "Chauffage"