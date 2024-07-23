/*
object = {
   , title: "Consommation d'énergie",
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
    subtitle: "Part des differentes consomations dans la consommation d'énergie globale",
    chart: 'bar',
    unit: 'kWh',
    calendarLegend: 'Le jour le plus où le batiment a le plus consommé est le',
    monthStripeLegend: 'Le mois où le bâtiment a le plus consommé est',
    compareBy: 'date', //part
    
    // Cards title and subtitle

    todaysCardTitle: "Aujourd'hui",
    todaysCardSubtitle: 'Consommations',

    averageCardTitle: 'Consommation moyenne',
    averageCardSubtitle: 'Sur la période sélectionnée',

    totalCardTitle: 'Consommation totale',
    totalCardSubtitle: 'Sur la période sélectionnée',

    controlEndpoints: [
        {
            label: 'Consommation Globale',
            min: null,
            max: null,
            name: 'Consommation Globale',
            color: '#000080',
            unit: 'kWh',
            stackGroup: '0',

            title: 'Consommation globale',
            subtitle: 'today',
            todayTitle: 'today',

            averageTitle: 'Consommation globale',
            averageSubtitle: '',

            totalTitle: 'Consommation globale',
            totalSubtitle: 'Consommation de référence',
            root: true,

        },
        {
            label: 'Consommation CVC',
            min: null,
            max: 3500,
            name: 'Consommation CVC',
            color: '#40E0D0',
            unit: 'kWh',
            stackGroup: '01',

            title: 'Pour la Consommation CVC',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation CVC',
            averageSubtitle: '',

            totalTitle: 'Consommation CVC',
            totalSubtitle: 'De la consommation globale',
            root: false,

        },
        {
            label: 'Consommation Escalier',
            min: null,
            max: 3500,
            name: 'Consommation Escalier',
            color: '#418FDD',
            unit: 'kWh',
            stackGroup: '01'

           , title: 'Pour la Consommation Escalier',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation Escalier',
            averageSubtitle: '',

            totalTitle: 'Consommation Escalier',
            totalSubtitle: 'De la consommation globale',
            root: false,

        },
        {
            label: 'Consommation Ascenseur',
            min: null,
            max: 3500,
            name: 'Consommation Ascenseur',
            color: '#2A52BE',
            unit: 'kWh',
            stackGroup: '01'

           , title: 'Pour la Consommation Asc',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation Asc',
            averageSubtitle: '',

            totalTitle: 'Consommation Asc',
            totalSubtitle: 'De la consommation globale',
            root: false,

        },
        {
            label: 'Consommation Exterieure',
            min: null,
            max: 3500,
            name: 'Consommation Exterieure',
            color: '#120A8F',
            unit: 'kWh',
            stackGroup: '01'

           , title: 'Pour la Consommation Exterieure',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation Ext',
            averageSubtitle: '',

            totalTitle: 'Consommation Ext',
            totalSubtitle: 'De la consommation globale',
            root: false,

        },
        {
            label: 'Consommation Eclairage',
            min: null,
            max: 3500,
            name: 'Consommation Eclairage',
            color: '#0F52BA',
            unit: 'kWh',
            stackGroup: '01'

           , title: 'Pour la Consommation Eclairage',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation Eclairage',
            averageSubtitle: '',

            totalTitle: 'Consommation Eclairage',
            totalSubtitle: 'De la consommation globale',
            root: false,

        },
        {
            label: 'Consommation Prise de Courant',
            min: null,
            max: 3500,
            name: 'Consommation Prise de Courant',
            color: '#7DF9FF',
            unit: 'kWh',
            stackGroup: '01'

           , title: 'Pour la Consommation Prise de Courant',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation Prise de Courant',
            averageSubtitle: '',

            totalTitle: 'Consommation Prise de Courant',
            totalSubtitle: 'De la consommation globale',
            root: false,

        },
        {
            label: 'Consommation Divers',
            min: null,
            max: 3500,
            name: 'Consommation Divers',
            color: '#191970',
            unit: 'kWh',
            stackGroup: '01'

           , title: 'Pour la Consommation Divers',
            todayTitle: 'today',
            subtitle: "De la consommation globale",
            totalSubtitle: "De la consommation globale",

            averageTitle: 'Consommation Divers',
            averageSubtitle: '',

            totalTitle: 'Consommation Divers',
            totalSubtitle: 'De la consommation globale',
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