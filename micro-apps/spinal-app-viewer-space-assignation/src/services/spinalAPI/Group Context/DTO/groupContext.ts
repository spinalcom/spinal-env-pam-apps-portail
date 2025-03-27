// * Interfaces
import {type INodeItem} from '@/interfaces';

type GroupContext = {
	context?: string;
	children?: GroupContext[];
} & INodeItem;

export type {GroupContext};
