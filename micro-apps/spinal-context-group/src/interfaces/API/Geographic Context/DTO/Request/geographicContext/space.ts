// * Interfaces
import {type INodeItem} from '../../../../../INodeItem';
import {type GeographicContext} from './geographicContext';

type GeographicContextSpace = {
	children: [GeographicContext];
} & INodeItem;

export {type GeographicContextSpace};
