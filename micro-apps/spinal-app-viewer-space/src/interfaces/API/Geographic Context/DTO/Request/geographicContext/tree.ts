// * Interfaces
import {type INodeItem} from '../../../../../INodeItem';
import {type GeographicContext} from './geographicContext';

type GeographicContextTree = {
	children: [GeographicContext];
} & INodeItem;

export {type GeographicContext, type GeographicContextTree};
