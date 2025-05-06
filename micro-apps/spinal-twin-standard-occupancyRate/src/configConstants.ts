import { ApiEndpoints } from './components/interfaces/configTypes';

export const apiEndpoints: ApiEndpoints = {
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
  equipmentContextList: 'building/{buildingId}/equipementsGroup/list',
  equipmentCategoryList: 'building/{buildingId}/equipementsGroup/{contextId}/category_list',
  equipmentGroupList: 'building/{buildingId}/equipementsGroup/{contextId}/category/{categoryId}/group_list',
  equipmentList: 'building/{buildingId}/equipementsGroup/{contextId}/category/{categoryId}/group/{groupId}/equipementList',
  thirdChartPositions: 'building/{buildingId}/equipment/get_position_multiple',
};

// Liste des temporalités
export const temporalities = ['Valeur Courante', 'Journée', 'Semaine', 'Mois', 'Trimestre', 'Année', 'Décennie'];