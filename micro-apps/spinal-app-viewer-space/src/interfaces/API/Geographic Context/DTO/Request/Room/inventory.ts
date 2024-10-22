// * Interfaces

import {type INodeItem} from '@/interfaces/INodeItem';

type RoomInventory = {
	inventories: RoomInventory[];
} & INodeItem;

export {type RoomInventory};
