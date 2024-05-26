import { IIdentifiable } from "./IIdentifiable";
import { IIndexableFromRoot } from "./IIndexableFroomRoot";

type IPregnant<T> = {
	children: Array<T & IPregnant<T> & IIdentifiable & IIndexableFromRoot>;
};

export {type IPregnant};
