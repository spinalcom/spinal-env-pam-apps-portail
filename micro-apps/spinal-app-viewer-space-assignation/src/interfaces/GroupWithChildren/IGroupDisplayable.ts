import { IPregnant } from "./IPregant";

// Enums
enum EGroupType {
	GRP_CONTEXT = 0,
	GRP_CATEGORY = 1,
	GRP_GROUP = 2,
	ROOM = 3,
	GRP_NONE = 5,
}

enum EAPIVerb {
	API_CREATION = 0,
	API_UPDATE = 1,
	API_DELETION = 2,
}

// Interfaces
type IGroupDisplayable<T, Z, E> = {
	applyBusinessRules(item: T): Promise<T>;
	get groupToDisplay(): Array<T & IPregnant<T>>;
	reloadGroupToDisplay(): Array<T & IPregnant<T>>;
};

export {EGroupType, EAPIVerb, type IGroupDisplayable};
