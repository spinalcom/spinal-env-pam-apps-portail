// * Interfaces
import { type IAPI } from "@/interfaces";

/**
 * @description Classes that provide the required methods for AAPI implementation.
 * @class
 */
class AAPI implements IAPI {
  getIdCurrentBuilding(): string {
    const idCurrentBuilding: string | undefined =
      window.localStorage.getItem("idBuilding");

    return idCurrentBuilding ? idCurrentBuilding : "";
  }
}

export { AAPI };
