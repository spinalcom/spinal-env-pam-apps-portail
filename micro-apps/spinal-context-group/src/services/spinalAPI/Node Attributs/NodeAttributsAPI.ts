// * Interfaces
import { AAPI } from "../AAPI";
import {
  type AttributeCategory,
  type Attribute,
  type NodeAttributs,
} from "./DTO";

// * Classes
import { SpinalAPI } from "../SpinalAPI";
import { NodeAttributsFactory } from ".";

/**
 * **API Classes**
 * @description This class is responsible for making API calls to the NodeAttributsAPI part.
 * @class
 */
class NodeAttributsAPI extends AAPI {
  private readonly _spinalApi: SpinalAPI | undefined;
  private readonly _genericErrMsg: string = "";

  public constructor() {
    super();
    try {
      this._genericErrMsg = "[Erreur] Une erreur est survenue !";
      this._spinalApi = SpinalAPI.getInstance(process.env.SPINAL_API_URL);
    } catch (e: any) {
      console.error(e);
    }
  }

  public async getAttributesMultipleNode(
    nodeDynamicIds: number[]
  ): Promise<NodeAttributs[]> {
    let requestPromise: Promise<any>;
    let response: NodeAttributs;
    let url: string | undefined;
    let arr: NodeAttributs[] = [];

    return new Promise<NodeAttributs[]>((resolve, reject) => {
      url = this._spinalApi?.createUrlWithPlatformId(
        super.getIdCurrentBuilding(),
        "/api/v1/node/attribute_list_multiple"
      );
      requestPromise = this._spinalApi?.post(url, [
        ...nodeDynamicIds,
      ]) as Promise<any>;

      if (requestPromise === undefined) {
        reject(new Error(this._genericErrMsg));
      }

      requestPromise
        .then((res: any) => {
          if (res.status !== 200) {
            reject(new Error(this._genericErrMsg));
          }

          for (const el of res.data) {
            response = NodeAttributsFactory.build({
              dynamicId: el.dynamicId,
              categoryAttributes: el.categoryAttributes,
            }) as NodeAttributs;
            arr.push(response);
          }
          resolve(arr);
        })
        .catch((e: any) => {
          reject(new Error(this._genericErrMsg));
        });
    });
  }
}

export { NodeAttributsAPI };
