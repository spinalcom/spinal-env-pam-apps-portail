import * as Factory from 'factory.ts'
import {type OperationMap, type OperationMapWithId} from '..'

const OperationMapFactory = Factory.Sync.makeFactory<OperationMap>({
	create: 0,
	read: 0,
	delete: 0,
	update: 0,
	deleteByAnother: 0,
	readByAnother: 0,
});

const OperationMapWithIdFactory = Factory.Sync.makeFactory<OperationMapWithId>({
	id: -1,
	operations: OperationMapFactory.build(),
});

export {OperationMapFactory, OperationMapWithIdFactory}