import {type IItemV1} from '@/interfaces';
import {type IPregnant} from './IPregant';
import {type IIndexableFromRoot} from './IIndexableFroomRoot';
import {type IDisplayable} from './IDisplayable';
import {type IIdentifiable } from './IIdentifiable';
import {type IOperation} from './IOperations'

// TODO Change to tree and branch terminology because it's weird
interface IGroupItem extends IItemV1, IIndexableFromRoot, IPregnant<IGroupItem>, IDisplayable, IIdentifiable, IOperation {
	type: number;
	color?: string;
	icon?: string;
	verb?: number;
}

export type {
	IGroupItem,
};
