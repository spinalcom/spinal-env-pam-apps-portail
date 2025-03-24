module.exports = {
    title: "OCCUPATION EN TEMPS RÉEL",
    chart: '%',
    subtitle:'',
    displayBuildingOccupancyChart: true,
    displaySecondChart: true,
    displayThirdChart: true,

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
        thirdChartPositions: 'building/{buildingId}/equipment/get_position_multiple',
    },
    
    entryPoints: [
        {
            name: 'DEI',
            type: 'geographicBuilding',
        },
        {
            context: 'Gestion des espaces',
            category: 'Typologie',
            group: 'Salle de réunion',
            type: 'geographicRoomGroup',
            source: [
                {
                    profileName: 'Occupation',
                    name: "Taux d'occupation",
                    type: 'Occupation', 
                }
            ]
        },
        {
            context: 'Gestion des équipements',
            category: 'Typologie',
            group: 'Positions de travail',
            type: 'BIMObjectGroup',
            source: [
                {
                    profileName: 'Occupation',
                    name: "Taux d'occupation",
                    type: 'Occupation', 
                }
            ]
        },
        
    ],
      labels: {
        downloadFileName: "Taux d'occupation"
    },
    charts: {
        firstChart: {
            label: "Taux d'occupation du bâtiment",
            backgroundColor: '#14202C',
            borderColor: '#14202C',
        },
        secondChart: {
            label: "Taux d'occupation des salles de réunion",
            backgroundColor: '#1C5791',
        },
        thirdChart: {
            label: "Taux d'occupation des positions de travail",
            backgroundColor: '#418FDD',
        }
    }
};