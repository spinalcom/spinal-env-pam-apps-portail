import * as Factory from 'factory.ts';
import { NodeAttributs } from '../DTO';

const NodeAttributsFactory: Factory.Sync.Factory<any, string | number | symbol> = Factory.Sync.makeFactory<NodeAttributs>({
	dynamicId: -1,
	categoryAttributes: [],
});

export {NodeAttributsFactory}