// * Interfaces
import {type IAPI} from '@/interfaces';

class AAPI implements IAPI {
	protected getIdCurrentBuilding(): string {
		const idCurrentBuilding: string | undefined = window.localStorage.getItem('idBuilding');

		return idCurrentBuilding ? idCurrentBuilding : '';
	}
}

export {AAPI};
