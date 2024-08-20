/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import Vue from "vue";

import { EmitterViewerHandler, VIEWER_SPRITE_CLICK, VIEWER_SPRITE_MOUSEOVER } from "spinal-viewer-event-manager";

interface ISpriteData {
	color: string;
	position: THREE.Vector3;
	dbId: number;
	modelId: string | number;
	data: any;
	component?: Vue;
}

const baseURL = require("../assets/circle.svg");



export class SpriteManager {
	private DataVizCore;
	private static _instance: SpriteManager;
	private _dataVizExtn: any;
	private _viewableType;
	private dbIdToViewable: { [key: number | string]: any } = {};
	private label3Ds = [];
	private cards3Ds = [];
	// private linesGlobal = [];
	private linesGlobal: { source: any; destination: any; line: THREE.Line; }[] = [];
	private drawedlines: number = 0;
	
	private nodeclickedId : number=0; 

	private constructor() { }

	public static getInstance(): SpriteManager {
		if (!this._instance) this._instance = new SpriteManager();
		return this._instance;
	}

	get dataVizExtn() {
		return this._dataVizExtn;
	}

	public async loadDataVisualizationExtension(viewer: Autodesk.Viewing.Viewer3D) {
		this._dataVizExtn = await viewer.loadExtension("Autodesk.DataVisualization");
		await viewer.loadExtension("Autodesk.Edit3D");

		if (!this.DataVizCore) {
			this.DataVizCore = Autodesk.DataVisualization.Core;
			this._viewableType = this.DataVizCore.ViewableType.SPRITE;
		}

		viewer.addEventListener(this.DataVizCore.MOUSE_CLICK, this._onSpriteClicked.bind(this));
		viewer.addEventListener(this.DataVizCore.MOUSE_HOVERING, this._onSpriteHovering.bind(this));
	}


	public async addCardComponent(viewer: Autodesk.Viewing.Viewer3D, data: any | any[]) {
		data = Array.isArray(data) ? data : [data];
		const dataMap = new Map();
		data.forEach(d => dataMap.set(d.dynamicId, d));

		for (const d of data) {
			if (!d.component) continue;
			const VueComponent = Vue.extend(d.component);
			const vueInstance = new VueComponent({ propsData: d });

			const label = new Autodesk.Edit3D.Label3D(viewer, d.position, "");
		
			viewer.overlays.impl.invalidate(true, true, true);


			label.container.appendChild(vueInstance.$mount().$el);
			const exists = this.cards3Ds.some(item => item.dynamicId === d.data.dynamicId);
			if (!exists) {
				this.cards3Ds.push({
					dynamicId: d.data.dynamicId,
					label: label,
					component: vueInstance,
				});
			}
  
		}
	}
	
	public async addComponentAsSprite(viewer: Autodesk.Viewing.Viewer3D, data: any | any[]) {
		// console.log("viewer", viewer);
		// console.log("data to draw", data);
		// console.log("drawedlines..............................................................");
  data = Array.isArray(data) ? data : [data];
  
  const dataMap = new Map();
		data.forEach(d => dataMap.set(d.dynamicId, d));
		await this.removeAllLines(viewer);

  for (const d of data) {
		if (!d.component) continue;
		//if last object of data
		
    // console.log(d.data.dynamicId);
		// console.log("parentData",d.data.parent);
    const VueComponent = Vue.extend(d.component);
    const vueInstance = new VueComponent({ propsData: d });

    const label = new Autodesk.Edit3D.Label3D(viewer, d.position, "");

    // Get parent data if it exists
		
		
		const parentPosition = this.getParentPosition(data, d.data.parent);
		// console.log("drawedlines", this.drawedlines)

		if (this.drawedlines < data.length) {

		// console.log("drawing all lines");
		if (parentPosition) {
			this.drawLineBetweenPositions(viewer, d.data.parent, d.data.dynamicId, parentPosition, d.position);
			this.drawedlines++;
		}
		}
		
		viewer.overlays.impl.invalidate(true,true,true);
		// if (d.data.last == true) {
		// 	this.drawedlines = true;
		// 	console.log("drawedlines true", this.drawedlines)
		// }

		label.container.appendChild(vueInstance.$mount().$el);
		const exists = this.label3Ds.some(item => item.dynamicId === d.data.dynamicId);
		if (!exists) {
			this.label3Ds.push({
				dynamicId: d.data.dynamicId,
				label: label,
				component: vueInstance,
			});
		}
  }
}
	

	public async drawLineBetweenPositions(viewer, source,destination,sourcePosition, destinationPosition) {
		
    // Create the geometry for the line
    const geometryLine = new THREE.Geometry();
    geometryLine.vertices.push(
        new THREE.Vector3(sourcePosition.x, sourcePosition.y, sourcePosition.z)
    );
    geometryLine.vertices.push(
        new THREE.Vector3(destinationPosition.x, destinationPosition.y, destinationPosition.z)
    );

    // Create the material for the line
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(0xFFB30F),
        transparent: true,
        depthWrite: false, 
        depthTest: false,
        linewidth: 4,
        opacity: 1.0,
        blending: THREE.NoBlending
    });

    // Create the line
		const line = new THREE.Line(geometryLine, material);
		// console.log("line", line);
		// line.material.color = new THREE.Color(0x00ff00);
    const sceneName = "LinesScene";
    if (!viewer.overlays.hasScene(sceneName)) {
        viewer.overlays.addScene(sceneName);
    }

    // Add the line to the overlay scene
		viewer.overlays.addMesh(line, sceneName);


		this.linesGlobal.push({
				source: source,
				destination: destination,
				line: line,
			});
		return null;
	}

	public getParentPosition(data, parentId) {
    for (const item of data) {
        if (item.modelId === parentId) {
            return item.position;
        }
    }
    return null;
	}
	public async updateLine(line: THREE.Line, color: THREE.Color, width: number) {
		// console.log("length of lines", this.linesGlobal.length);
		// console.log("Line ", line);
		line.material.color.set(color);
		line.material.linewidth = width;
		line.material.needsUpdate = true;

		if (line.geometry instanceof THREE.BufferGeometry) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
			line.geometry.attributes.position.needsUpdate = true;
		} else {
			line.geometry.verticesNeedUpdate = true;
		}
		
		// console.log("end");
	}
	public async removeAllLines(viewer: Autodesk.Viewing.Viewer3D) {
		// console.log("Removing all lines");
		this.drawedlines = 0;
		 const sceneName = "LinesScene";
		if (viewer.overlays.hasScene(sceneName)) {
			viewer.overlays.clearScene(sceneName);
		}
	}
	public removeStyleLine(dynamicIds: Array<number>){
		for (let i = 0; i < dynamicIds.length; i++) {
			for (let line of this.linesGlobal) {
				if (dynamicIds[i] == line.source) {
					this.updateLine(line.line, new THREE.Color(0xFFB30F),4);//selected line vers fils
				} else if (dynamicIds[i] == line.destination) { 
					this.updateLine(line.line, new THREE.Color(0xFFB30F),4);// vers parent
				}
			}
		}
	}

	public deselectSprites(dynamicIds: Array<number>) {
			for (let i = 0; i < dynamicIds.length; i++) {
				// console.log("dynamicIds", dynamicIds[i])
				for (let label of this.label3Ds) {
				
					if (dynamicIds[i] == label.dynamicId) {
						label.component._isNotSelected();
				}
			}
			
		}
	}
	public async selectSprites(dynamicIds: Array<number>) {
		// console.log("update Sprites Function");
		// console.log("this.labels", this.label3Ds)
		for (let i = 0; i < dynamicIds.length; i++) {
			// console.log("dynamicIds", dynamicIds[i])
			for (let label of this.label3Ds) {
				if (dynamicIds[i] == label.dynamicId) {
						label.component._isSelected();
				}else {
					label.component._isNotSelected();
				}
				//selecte the rest of sprites
				for(let line of this.linesGlobal){
					if((label.dynamicId == line.destination) && (line.source == dynamicIds[i])){
						// label.component._isSelected();
					}
				}
			}
			for (let line of this.linesGlobal) {
				if (dynamicIds[i] == line.source) {
					// console.log("line first case");

					this.updateLine(line.line, new THREE.Color(0x00ff00),10);//selected line vers fils
				} else if (dynamicIds[i] == line.destination) { 

					// console.log("line second case");
					this.updateLine(line.line, new THREE.Color(0x0000FF),10);// vers parent
				}
				else {

					// console.log("line 3rd case");
					this.updateLine(line.line, new THREE.Color(0xFFB30F),4);// unselected line
				}
			}
			
		}
	}


	public async createSprite(viewer: Autodesk.Viewing.Viewer3D, data: ISpriteData | ISpriteData[]) {
		const viewableData = new this.DataVizCore.ViewableData();
		viewableData.spriteSize = 24;

		data = Array.isArray(data) ? data : [data];

		for (const item of data) {
			if (!item.position || (item.position.x == null && item.position.y == null && item.position.z == null)) continue;

			const spriteColor = new THREE.Color(item.color);
			const style = new this.DataVizCore.ViewableStyle(this._viewableType, spriteColor, baseURL);

			const viewable = new this.DataVizCore.SpriteViewable(item.position, style, item.dbId);
			viewable.contextData = item.data;

			this.dbIdToViewable[item.dbId] = viewableData;

			this._addSpriteToObject(item.dbId, item.dbId, viewable);
			viewableData.addViewable(viewable);
		}

		await viewableData.finish();
		this._dataVizExtn.addViewables(viewableData);
	}

		public removeCards() {
		if (this._dataVizExtn) this.dataVizExtn.removeAllViewables();
		this.cards3Ds.slice().forEach(l => l.label.dtor());
		this.cards3Ds = [];
	}


	public removeSprites() {
		if (this._dataVizExtn) this.dataVizExtn.removeAllViewables();
		this.label3Ds.slice().forEach(l => l.label.dtor());
		this.label3Ds = [];
	}

	private _addSpriteToObject(modelId: string | number, dbId: number, viewable: any) {
		if (!this.dbIdToViewable[modelId]) this.dbIdToViewable[modelId] = {};

		this.dbIdToViewable[modelId][dbId] = viewable;
	}

	private _showOrHideSpritesOnIsolation(isolation: { model: Autodesk.Viewing.Model; ids: number[] }[]) {
	}

	private _converToObject(isolation: { model: Autodesk.Viewing.Model; ids: number[] }[]): { [key: string | number]: number[] } {
		return isolation.reduce((obj, { model, ids }) => {
			if (!obj[model.id]) obj[model.id] = [];
			obj[model.id].push(...ids);
			return obj;
		}, {});
	}

	private _onSpriteHovering(event) {
		this._sendSpriteEvent(event.dbId, VIEWER_SPRITE_MOUSEOVER);
	}

	private _onSpriteClicked(event) {
		this._sendSpriteEvent(event.dbId, VIEWER_SPRITE_CLICK);
	}

	private _sendSpriteEvent(dbId: number, eventName: any) {
		
    
		const dataviewable = this.dbIdToViewable[dbId];
		if (!dataviewable) return;

		const viewable = dataviewable.viewables.find((v) => v.dbId === dbId);
		if (viewable && viewable.contextData) {
			const emitter = EmitterViewerHandler.getInstance();
			emitter.emit(eventName, {
				pos: viewable.position,
				style: viewable.style,
				img: viewable.style?.url,
				node: viewable.contextData,
			} as any);
		}
	}
}

export default SpriteManager;
