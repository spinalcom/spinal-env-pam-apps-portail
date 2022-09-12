/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

export function loadModel(
  viewer: Autodesk.Viewing.Viewer3D,
  path: string,
  option: any = {},
  start: boolean = false
): Promise<Autodesk.Viewing.Model> {
  return new Promise((resolve, reject) => {
    let m: Autodesk.Viewing.Model = undefined;
    const fn = (e: any) => {
      if (m && e.model.id === m.id) {
        viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
        resolve(m);
      }
    };
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, fn);
    let fct = start ? viewer.start : viewer.loadModel;
    fct.call(
      viewer,
      path,
      option,
      (model: Autodesk.Viewing.Model): void => {
        m = model;
      },
      // @ts-ignore
      reject
    );
  });
}
