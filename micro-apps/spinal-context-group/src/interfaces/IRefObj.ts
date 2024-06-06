import {type INodeItem} from './INodeItem';

// Export interface INodeItem {
//     dynamicId: number;
//     staticId: string;
//     name: string;
//     type: string;
//   }

type IObj = {
	dbId?: number;
	version?: number;
	externalId?: string;
	roomIndex?: number;
} & INodeItem;

type IParentInfo = {
	patrimoineId?: string;
	buildingId?: string;
	floorId: string;
};

type IRoom = {
	bimFileId?: string;
	infoReferencesObjects?: IObj[];
	color: string; // Hover ?
	parentInfo?: IParentInfo;
	categoryAttributes?: any[];
} & INodeItem;


export type {IObj, IRoom};
