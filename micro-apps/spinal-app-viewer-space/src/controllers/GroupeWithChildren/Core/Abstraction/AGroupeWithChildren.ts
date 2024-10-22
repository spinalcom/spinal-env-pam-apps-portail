abstract class AGroupeWithChildren<T, Z> {
	abstract addNewItem(newItem: T, parent: T | undefined): Promise<T>;
	abstract deleteItem(item: T): Promise<T>;
	abstract editItem(newItem: Partial<T>, item: T): Promise<T>;
	abstract findItemInTree(item: T, items: T[]): T | undefined;
	abstract loadData(data: T[]): Promise<Z>;
	abstract getTree(): T[];
	abstract getPathItem(item: T): T[];
	abstract getParentItem(item: T, arr?: T[]): T;
}

export {AGroupeWithChildren};
