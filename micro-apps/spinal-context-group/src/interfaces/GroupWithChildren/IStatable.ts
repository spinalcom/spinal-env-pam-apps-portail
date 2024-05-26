type TGroupState =
  | 'AddedFromClient'
  | 'DeletedFromClient'
  | 'DownloadedFromServer'
  | 'ModifiedFromClient';

type IStatable = {
	state: [TGroupState];
};

export {type IStatable, type TGroupState};
