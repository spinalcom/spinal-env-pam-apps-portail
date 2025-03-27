// Interfaces
import {type IGroupItem} from '.';
// Enums
import {type EAPIVerb} from '.';

type IApiGroupContext = {
	getGroupContextTree(): Promise<IGroupItem[]>;

	createGenericRequest(
		item: IGroupItem,
		verb: EAPIVerb,
		path: IGroupItem[]
	): Promise<any>;
};

export type {IApiGroupContext};
