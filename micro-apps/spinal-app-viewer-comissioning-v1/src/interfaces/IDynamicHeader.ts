

export interface IDynamicHeader { 
    text: string,
    value: string,
    sortable: boolean
    id: number
    parentName: string
}


export interface IRegexFilter {
    column: string,
    expression : string,
}