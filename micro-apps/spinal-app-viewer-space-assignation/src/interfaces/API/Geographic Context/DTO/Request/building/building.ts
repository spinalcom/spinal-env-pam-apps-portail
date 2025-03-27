// * Interfaces

import {type INodeItem} from '@/interfaces/INodeItem';

type Building = {
	adress: string;
	area: number;
} & INodeItem;

export {
	type Building as Building,
};
