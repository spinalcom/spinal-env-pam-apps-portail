import * as Factory from 'factory.ts';

import { IGroupItem } from '../Interfaces';

const GroupItemFactory: Factory.Sync.Factory<any, string | number | symbol> = Factory.Sync.makeFactory<IGroupItem>({
	type: -1,
	color: "#000000",
	icon: 'mdi-account',
	verb: 0,
	title: 'Empty Title',
	idIndexesFromRoot: [],
	children: [],
	id:-1,
	display: false,
	operation: 'create'
});

export {GroupItemFactory}