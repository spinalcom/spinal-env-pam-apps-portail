module.exports = {
    title: "OCCUPATION EN TEMPS RÉEL",
    chart: '%',
    compareBy: 'date',
    subtitle:'',
    displayBuildingOccupancyChart: true,
    displayEquipmentChart: true,
    displayMeetingRoomChart: true,

    controlEndpoints: [
        {
            label: 'Taux d\'occupation',
            min: 0,
            max: 100,
            name: 'taux d\'occupation',
            color: '#A7001E',
            stackGroup: '1',
            title: 'Taux d\'occupation',
            subtitle: 'today',
            todayTitle: 'today',
            averageTitle: 'Taux d\'occupation moyen',
            totalTitle: 'Taux d\'occupation total',
            root: false,
        }
    ],
    temporalities: ['Valeur Courante', 'Journée', 'Semaine', 'Mois', 'Trimestre', 'Année', 'Décennie'],

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
        floorAttributes: 'building/{buildingId}/node/{dynamicId}/attributsList',
        // New API endpoints for equipment groups
        equipmentContextList: 'building/{buildingId}/equipementsGroup/list',
        equipmentCategoryList: 'building/{buildingId}/equipementsGroup/{contextId}/category_list',
        equipmentGroupList: 'building/{buildingId}/equipementsGroup/{contextId}/category/{categoryId}/group_list',
        equipmentList: 'building/{buildingId}/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/equipementList',
        equipmentPositions: 'building/{buildingId}/equipment/get_position_multiple',
    },
    
    entryPoints: [
        {
            context: 'Gestion des espaces',
            category: 'Typologie',
            group: 'Salle de réunion',
            type: 'geographicRoomGroup',
        },
        {
            context: 'Gestion des équipements',
            category: 'Typologie',
            group: 'Positions de travail',
            type: 'BIMObjectGroup',
            
        },
    ],
    sources: [
        {
            profileName: 'Occupation',
            name: "Taux d'occupation",
            type: 'Occupation', 
        }
    ]
};

/*     filters: {
        occupationRate: 'taux d\'occupation',
        floor: 'floor',
        room: 'room',
    },
    endpointCriteria: {
        name: 'taux d\'occupation',
        type: 'Occupation'
    },
    contextNames: {
        gestionDesEspaces: 'Gestion des espaces',
        gestionDesEquipements: 'Gestion des équipements',

    },
    categoryNames: {
        typologie: 'Typologie',
    },
    groupNames: {
        meetingRoom: 'Salle de réunion',
        workPositions: 'Positions de travail',

 
    },*/