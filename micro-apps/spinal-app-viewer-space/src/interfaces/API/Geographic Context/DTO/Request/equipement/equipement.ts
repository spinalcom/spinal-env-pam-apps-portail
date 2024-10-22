// * Interfaces
import {type INodeItem} from '@/interfaces/INodeItem';

type Equipements = {
	bimFileId: string;
	version: number;
	externalId: string;
	dbid: string;
} & INodeItem;

type EquipementEndpoints = {
	currentValue: 0;
} & INodeItem;

type EquipementControlEndpointSchema = EquipementEndpoints;

export {type EquipementControlEndpointSchema, type EquipementEndpoints, type Equipements};
