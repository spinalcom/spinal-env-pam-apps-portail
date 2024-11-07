import {type INodeItem} from '@/interfaces';
import * as Factory from 'factory.ts';

type Attribute = {
	label?: string;
	value?: string;
	type?: string;
	unit?: string;
};

type AttributeCategory = {
	attributs?: Attribute[];
} & INodeItem;

type NodeAttributs = {
	dynamicId: number;
	categoryAttributes?: AttributeCategory[];
};

export {
	type Attribute, type AttributeCategory, type NodeAttributs,
};
