module.exports = {
    title: "OCCUPATION EN TEMP RÉEL",
    chart: '%',
    //calendarLegend: 'Le jour le plus où le batiment a le plus consommé est le',
    //monthStripeLegend: 'Le mois où le bâtiment a le plus consommé est',
    compareBy: 'date',

    // Cards title and subtitle

    //averageCardTitle: 'Titre de la card consommation au m²',
    //averageCardSubtitle: 'Description de la consommation au m²',

/*     totalCardTitle: 'Title de la card totale',
    totalCardSubtitle: 'Description de la card totale', */

    controlEndpoints: [
        {
            label: 'Taux d\'occupation',
            min: 0,
            max: 100,
            name: 'taux d\'occupation',
            color: '#A7001E',
            unit: '%',
            stackGroup: '1',

            title: 'Taux d\'occupation',
            subtitle: 'today',
            todayTitle: 'today',

            averageTitle: 'Taux d\'occupation moyen',
            averageSubtitle: '',

            totalTitle: 'Taux d\'occupation total',
            totalSubtitle: 'Par rapport à la période précédente',
            root: false,
        }
    ],
    
    cards: ['total', 'average', 'today'],
    temporalities: ['Valeur Courante', 'Journée', 'Semaine', 'Mois', 'Trimestre', 'Année', 'Décennie']

};