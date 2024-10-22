// * Interfaces
import {type INodeItem} from '@/interfaces';
import {type IDisplayable} from '@/services/GroupeWithChildren/Interfaces/IDisplayable';
import {type IPregnant} from '@/services/GroupeWithChildren/Interfaces/IPregant';

type RoomGroup = {
	context?: string;
} & IDisplayable & INodeItem & IPregnant<RoomGroup>;

export type {RoomGroup};
