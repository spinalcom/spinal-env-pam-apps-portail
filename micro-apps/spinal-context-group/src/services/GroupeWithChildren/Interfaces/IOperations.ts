import * as Factory from 'factory.ts';

// * Types
import {type IIdentifiable} from './IIdentifiable';



type OperationState = 'create' | 'read' | 'readByAnother' | 'delete' | 'update' | 'deleteByAnother';

type OperationMap = Record<OperationState, number>;

type IOperation = {
	operation?: OperationState;
};

type OperationMapWithId = {
	operations: OperationMap;
} & IIdentifiable;

export {type IOperation, type OperationMapWithId, type OperationState, type OperationMap};
