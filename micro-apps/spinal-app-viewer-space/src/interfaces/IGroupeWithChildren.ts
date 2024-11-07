import { IItemV1 } from "./IItemV1"

interface IGroupeItem extends IItemV1 {
    type: EGroupeType,
    children: IGroupeItem[],
    state: [TGroupeState],
    idIndexesFromRoot: Array<number>
}

enum EGroupeType {
    GRP_CONTEXT = 0,
    GRP_CATEGORY = 1,
    GRP_GROUP = 2,
    GRP_NONE = 3
}

type TGroupeOperation = "Success" | "Failure" | "Error"

type TGroupeState = "DownloadedFromServer" | "AddedFromClient" | "ModifiedFromClient" | "DeletedFromClient" 


export {IGroupeItem, EGroupeType, TGroupeState, TGroupeOperation}