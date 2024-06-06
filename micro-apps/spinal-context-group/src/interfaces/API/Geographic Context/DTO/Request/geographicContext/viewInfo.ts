import {type INodeItem} from '@/interfaces/INodeItem';

type GeographicContextViewInfo = {
	id: string;
	staticId: string;
	buildingId: string;
	floorId: string;
	roomId?: string;
	patrimoineId?: string;
	dynamicId: number;
	displayValue?: string | number;
	color?: string;
};

export {type GeographicContextViewInfo};
