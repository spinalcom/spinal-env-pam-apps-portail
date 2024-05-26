import {type IItemV1} from '@/interfaces';

type IGroupItem<T> = {
	type: number;
	children: T[];
	state: [TGroupState];
	idIndexesFromRoot: number[];
	info?: InfoGroup;
} & IItemV1;

type InfoGroup = {
	color?: string;
	icon?: string;
	title?: string;
	type?: number;
	verb?: number;
};

type TGroupOperation = 'Success' | 'Failure' | 'Error';

type TGroupState =
  | 'AddedFromClient'
  | 'DeletedFromClient'
  | 'DownloadedFromServer'
  | 'ModifiedFromClient';

export type {
	IGroupItem, InfoGroup, TGroupState, TGroupOperation,
};
