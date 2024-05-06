// * Interfaces

import {type INodeItem} from '@/interfaces/INodeItem';

type FloorInfoReferencesObjects = {
	bimFileId?: string;
	version?: number;
	externalId?: string;
	dbid?: string;
} & INodeItem;

type FloorReferenceObjectList = {
	bimFileId?: string;
	infoReferencesObjects: FloorInfoReferencesObjects[];
} & INodeItem;

export {type FloorInfoReferencesObjects, type FloorReferenceObjectList};
