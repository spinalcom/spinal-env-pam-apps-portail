// * Implementation Simple
// TODO Faire en sort que cette classe implement/extends d'une interfaces
// TODO Refacto this en qqchose d'un peu plus clean
// Interfaces
import { IGroupItem, Translator } from "../Interfaces";

// Enums
import { EAPIVerb } from "../Interfaces";

/**
 * This class generate payload
 * @class GrpContextTranslator
 * @implements {Translator<IGroupItem, EAPIVerb>}
 */
class GrpContextTranslator implements Translator<IGroupItem, EAPIVerb> {
  private _lexicon: Array<Array<(item: IGroupItem) => any>> = [];

  constructor() {
    this.initLexicon();
  }

  public translate(item: IGroupItem, verbToUse: EAPIVerb): any {
    return this._lexicon[verbToUse][item.type](item);
  }

  private initLexicon() {
    const arrCreate: Array<(item: IGroupItem) => any> = [
      this.getCreateGrpContextPayload,
      this.getCreateGrpCategoryPayload,
      this.getCreateGrpGroupPayload,
    ];

    const arrUpdate: Array<(item: IGroupItem) => any> = [
      this.getUpdateGrpContextPayload,
      this.getUpdateGrpCategoryPayload,
      this.getUpdateGrpGroupPayload,
    ];

    const arrDeletion: Array<(item: IGroupItem) => any> = Array(3).fill(
      (item: IGroupItem) => undefined
    );
    this._lexicon = [arrCreate, arrUpdate, arrDeletion];
  }

  private getCreateGrpContextPayload(item: IGroupItem): any {
    return {
      contextName: item.title,
      childrenType: "geographicRoom",
    };
  }

  // * POST

  private getCreateGrpCategoryPayload(item: IGroupItem) {
    return {
      categoryName: item.title,
      iconName: item?.icon ?? "",
    };
  }

  private getCreateGrpGroupPayload(item: IGroupItem) {
    return {
      groupName: item.title,
      colorName: item?.color ?? "",
    };
  }

  // * PUT

  private getUpdateGrpContextPayload(item: IGroupItem) {
    return {
      newContextName: item.title,
    };
  }

  private getUpdateGrpCategoryPayload(item: IGroupItem) {
    return {
      newNameCategory: item.title,
      newNameIcon: item?.icon,
    };
  }

  private getUpdateGrpGroupPayload(item: IGroupItem) {
    return {
      newNameGroup: item.title,
      newNameColor: item?.color,
    };
  }
}

export { GrpContextTranslator };
