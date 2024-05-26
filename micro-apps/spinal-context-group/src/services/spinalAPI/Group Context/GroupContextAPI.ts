// * Classes
import { GroupContextPayloadGenerator } from "./PayloadGenerator";
import { type SpinalAPI } from "../SpinalAPI";
import { AAPI } from "../AAPI";

// * Interfaces
import {
  type IApiGroupContext,
  type IGroupItem,
} from "../../../interfaces/GroupWithChildren";

// * DTO
import { type GroupContext } from "./DTO";

// * Enums
import { EAPIVerb, EGroupType } from "../../../interfaces/GroupWithChildren";

// * Factory
import { GroupItemFactory } from "../../../interfaces/GroupWithChildren";



/**
 * This class contain every endpoint that we can use in order to communicate with the API
 * @class SpinalAPIConnector
 * @implements {IApiGroupContext}
 */
class GroupContextApi extends AAPI implements IApiGroupContext {
  private readonly _apiInstance: SpinalAPI | undefined = undefined;
  private get _endpointGroupContextList() {
    return "api/v1/groupContext/list";
  }

  private get _endpointGroupContextTree() {
    return "api/v1/groupContext/[id-0]/tree";
  }

  private readonly _genericError: string;

  private readonly _grpCtxPayloadGenerator: GroupContextPayloadGenerator | undefined =
    undefined;

  private _lexicon: string[][] = [];

  constructor(apiInstance: SpinalAPI) {
    super();
    try {
      this._apiInstance = apiInstance;
      this._grpCtxPayloadGenerator = new GroupContextPayloadGenerator();
      this._genericError = "Une erreur est survenue !";
      this.initLexicon();
    } catch (error) {
      throw new Error(this._genericError);
    }
  }

  public async getGroupContextTree(): Promise<IGroupItem[]> {
    return new Promise<IGroupItem[]>((resolve, reject) => {
      const req: Promise<any> = this.getGrpContextListFromServer();

      this.extractGrpCtxList(req)
        .then((result: IGroupItem[]) => result)
        .then((result: IGroupItem[]) => this.getPmsGrpCtxTree(result))
        .then(([pms, result]) => this.buildGroupItemTree(pms, result))
        .then((result: IGroupItem[]) => resolve(result))
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  public async createGenericRequest(
    item: IGroupItem,
    verb: EAPIVerb,
    path: IGroupItem[]
  ): Promise<any> {
    let url = "";
    let data: any;

    return new Promise<any>((resolve, reject) => {
      if (!this._apiInstance) {
        reject(new Error(this._genericError));
      }

      url =
        this._apiInstance?.createUrlWithPlatformId(
          this.getIdCurrentBuilding(),
          this.fillUrlTemplate(this._lexicon[verb][item.type], path)
        ) ?? "";
      data = this._grpCtxPayloadGenerator?.translate(item, verb);
      switch (verb) {
        case EAPIVerb.API_CREATION:
          resolve(this._apiInstance.post(url, data));
          break;
        case EAPIVerb.API_UPDATE:
          resolve(this._apiInstance.put(url, data));
          break;
        case EAPIVerb.API_DELETION:
          resolve(this._apiInstance.delete(url));
          break;
      }
    });
  }

  // ------------------------PRIVATE-----------------------------

  private initLexicon() {
    const createEndpoints: string[] = [
      "api/v1/groupContext/create",
      "api/v1/groupContext/[id-0]/create_category",
      "api/v1/groupeContext/[id-0]/category/[id-1]/create_group",
    ];
    const updateEndpoints: string[] = [
      "api/v1/groupContext/[id-0]/update",
      "api/v1/groupContext/[id-0]/category/[id-1]/update",
      "api/v1/groupContext/[id-0]/category/[id-1]/group/[id-2]/update",
    ];
    const deleteEndpoints: string[] = [
      "api/v1/groupContext/[id-0]/delete",
      "api/v1/groupContext/[id-0]/category/[id-1]/delete",
      "api/v1/groupContext/[id-0]/category/[id-1]/group/[id-2]/delete",
    ];
    this._lexicon = [createEndpoints, updateEndpoints, deleteEndpoints];
  }

  private async extractGrpCtxList(req: Promise<any>): Promise<IGroupItem[]> {
    let groupContexts: IGroupItem[] = [];
    let grpContextFiltered: any[] = [];

    return new Promise<IGroupItem[]>((resolve, reject) => {
      req.then((res) => {
        if (!res?.data || res.status !== 200) {
          reject(new Error(this._genericError));
        }

        grpContextFiltered = res.data.filter(
          (el: GroupContext) =>
            el.name && el.dynamicId && el.type === "geographicRoomGroupContext"
        );
        // If the element is not correctly formatted i don't take it
        groupContexts = grpContextFiltered.map(
          (el: GroupContext, index: number): IGroupItem =>
            GroupItemFactory.build({
              title: el.name,
              id: el.dynamicId,
              display: true,
              children: [],
              type: EGroupType.GRP_CONTEXT,
              idIndexesFromRoot: [index],
            })
        );

        resolve(groupContexts);
      });
    });
  }

  private async buildGroupItemTree(
    requests: Array<Promise<any>>,
    groupContext: IGroupItem[]
  ): Promise<IGroupItem[]> {
    let grpContext: IGroupItem | undefined;

    return new Promise<IGroupItem[]>((resolve, reject) => {
      Promise.all(requests)
        .then((responses: any) => {
          for (const response of responses) {
            if (!response?.data?.children || response.status !== 200) {
              continue;
            }

            grpContext = groupContext.find(
              (el: IGroupItem) => el.id === response.data.dynamicId
            );
            if (grpContext) {
              this.getGrpCategoryFromGrpContext(
                grpContext,
                response.data.children as GroupContext[]
              );
            }
          }

          resolve(groupContext);
        })
        .catch((err: any) => {
          console.error(err);
          reject(new Error(this._genericError));
        });
    });
  }

  private getGrpCategoryFromGrpContext(
    grpContext: IGroupItem,
    grpCategory: GroupContext[]
  ) {
    let grpCategoryTmp: IGroupItem;

    for (const [i, category] of grpCategory.entries()) {
      if (!category.name || !category.dynamicId) {
        continue;
      }

      grpCategoryTmp = GroupItemFactory.build({
        title: (category.name as string) ?? "",
        id: (category.dynamicId as number) ?? -1,
        children: [],
        display: true,
        type: EGroupType.GRP_CATEGORY,
        idIndexesFromRoot: [
          ...grpContext.idIndexesFromRoot,
          grpContext.children.length,
        ],
      });
      if (category.children && Array.isArray(category.children)) {
        this.getGrpGroupFromGrpCategory(grpCategoryTmp, category.children);
      }

      grpContext.children.push(grpCategoryTmp);
    }
  }

  private getGrpGroupFromGrpCategory(
    grpCategory: IGroupItem,
    grpGroup: GroupContext[]
  ) {
    let grpGroupTmp: IGroupItem;

    for (const [i, group] of grpGroup.entries()) {
      if (!group.name || !group.dynamicId) {
        continue;
      }

      grpGroupTmp = GroupItemFactory.build({
        title: group.name as string,
        id: group.dynamicId as number,
        children: [],
        display: true,
        type: EGroupType.GRP_GROUP,
        idIndexesFromRoot: [...grpCategory.idIndexesFromRoot, i],
      });
      grpGroupTmp.children = this.getRoomFromGrpGroup(group, grpGroupTmp);
      grpCategory.children.push(grpGroupTmp);
    }
  }

  private getRoomFromGrpGroup(
    group: GroupContext,
    parent: IGroupItem
  ): IGroupItem[] {
    let roomTmp: IGroupItem;

    try {
      const rooms: IGroupItem[] = group.children.map(
        (el: GroupContext, index: number) => {
          if (!el.name || !el.dynamicId) {
            return {};
          }

          roomTmp = GroupItemFactory.build({
            ...el,
            type: EGroupType.ROOM,
            title: el.name,
            id: el.dynamicId,
            idIndexesFromRoot: [...parent.idIndexesFromRoot, index],
          });
          return roomTmp;
        }
      ) as IGroupItem[];
      return rooms;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  private async getGrpContextListFromServer(): Promise<any> {
    let url = "";

    return new Promise((resolve, reject) => {
      if (!this._apiInstance) {
        reject("[API Instance] => Not defined");
      }
      url = this._apiInstance.createUrlWithPlatformId(
        this.getIdCurrentBuilding(),
        this._endpointGroupContextList
      );
      resolve(this._apiInstance.get(url));
    });
  }

  private getPmsGrpCtxTree(
    grpTree: IGroupItem[]
  ): [Array<Promise<any>>, IGroupItem[]] {
    let url = "";
    const reqArr: Array<Promise<any>> = [];

    try {
      if (!this._apiInstance) {
        throw new Error(this._genericError);
      }

      for (const [, grpContext] of grpTree.entries()) {
        url = this._apiInstance.createUrlWithPlatformId(
          this.getIdCurrentBuilding(),
          this._endpointGroupContextTree.replace(
            "[id-0]",
            grpContext.id.toString()
          )
        );
        reqArr.push(this._apiInstance.get(url) as Promise<any>);
      }

      return [reqArr, grpTree];
    } catch (err: any) {
      throw new Error(err);
    }
  }

  private fillUrlTemplate(
    templateEndpoint: string,
    path: IGroupItem[]
  ): string {
    let buffer: string = templateEndpoint;
    let token = "";

    try {
      for (const [i, item] of path.entries()) {
        token = `id-${i}`;
        buffer = buffer.replace(token, item.id.toString());
        buffer = buffer.replaceAll(/[${}]/gm, "");
        buffer = buffer.replaceAll(/[\[\]]/gm, "");
      }

      return buffer;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}

export { GroupContextApi };
