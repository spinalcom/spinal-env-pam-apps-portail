module.exports = {
    title: "OCCUPATION EN TEMPS RÉEL",
    chart: '%',
    compareBy: 'date',

    // Cards title and subtitle
    averageCardTitle: 'Titre de la card consommation au m²',
    averageCardSubtitle: 'Description de la consommation au m²',
    totalCardTitle: 'Title de la card totale',
    totalCardSubtitle: 'Description de la card totale',

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
    temporalities: ['Valeur Courante', 'Journée', 'Semaine', 'Mois', 'Trimestre', 'Année', 'Décennie'],

    // New configurations for API endpoints and filters
    apiEndpoints: {
        building: 'building/{buildingId}/building/read',
        floors: 'building/{buildingId}/floor/list',
        controlEndpointList: 'building/{buildingId}/node/{dynamicId}/control_endpoint_list',
        timeSeries: 'building/{buildingId}/endpoint/{dynamicId}/timeSeries/read/{start}/{end}',
        timeSeriesMultiple: 'building/{buildingId}/endpoint/timeSeries/read_multiple/{start}/{end}',
        roomPositions: 'building/{buildingId}/room/get_position_multiple',
        attributeListMultiple: 'building/{buildingId}/node/attribute_list_multiple',
        groupContextList: 'building/{buildingId}/groupContext/list',
        categoryList: 'building/{buildingId}/groupeContext/{contextId}/category_list',
        groupList: 'building/{buildingId}/groupeContext/{contextId}/category/{categoryId}/group_list',
        roomList: 'building/{buildingId}/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/roomList',
        controlEndpointListMultiple: 'building/{buildingId}/node/control_endpoint_list_multiple',
        contextList: 'building/{buildingId}/context/list',
        contextTree: 'building/{buildingId}/context/{contextId}/tree/{numberOfLevel}/depth',
        nodeChildren: 'building/{buildingId}/node/{nodeId}/children'
      },
    filters: {
        occupationRate: 'taux d\'occupation',
        floor: 'floor',
        room: 'room',
    },
    endpointCriteria: {
        name: 'taux d\'occupation',
        type: 'Occupation'
    }
};