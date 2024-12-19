import { SpinalAPI } from "../SpinalAPI";


export async function uploadDoc(buildingId: string, refrenceId: number, file: FormData){
    const spinalAPI = SpinalAPI.getInstance();
    const url = spinalAPI.createUrlWithPlatformId(buildingId, `api/v1/node/${refrenceId}/upload_file`);
    const res = await spinalAPI.post(url, file )
    return res.data;
}


export async function deleteFile(buildingId: string, refrenceId: number, fileId: number){
    const spinalAPI = SpinalAPI.getInstance();
    const url = spinalAPI.createUrlWithPlatformId(buildingId, `api/v1/node/${refrenceId}/delete_file/${fileId}`);
    const res = await spinalAPI.delete(url)
    console.log(res);
    return res;
}