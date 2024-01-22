import { IConfig } from "../../../../interfaces/IConfig";
import * as ticketAPI from "../../../spinalAPI/Workflow & ticket/ticketContext";
import * as nodeAPI from "../../../spinalAPI/Attributes/nodeAttributes";
import * as geoAPI from "../../../spinalAPI/GeographicContext/geographicContext"



export async function loadTickets( buildingId: string, config: IConfig): Promise<Array<any>> {
    const stepList = <any[]>[];
    const workflows = await ticketAPI.getWorkflowList();
    const workflowList = workflows.filter((w) => config.workflowList.includes(w.name));
    for (const workflow of workflowList){
        const processList = await ticketAPI.getProcessList(workflow.dynamicId);
        for(const process of processList){
            const steps = await ticketAPI.getStepList(workflow.dynamicId, process.dynamicId);
            stepList.push(...steps);
        }
    }
    const ticketList = (await ticketAPI.getTicketListMultiple(stepList.map((s) => s.dynamicId))).flatMap((result) => result.tickets);
    const detailedTickets = await ticketAPI.getTicketDetailsMultiple(ticketList.map((t) => t.dynamicId));
    // const detailedTickets_withoutError_only_BIMOBJ = detailedTickets.filter((t) => (!t.error && t.elementSelected.type == "BIMObject"));
    const detailedTickets_reduced = detailedTickets.reduce((acc, t) => {
        if(!t.error && t.elementSelected.type == "geographicRoom") acc.rooms.push(t);
        else if(!t.error && t.elementSelected.type == "BIMObject") acc.BIMObjects.push(t);
        return acc;
    }, { rooms: [], BIMObjects: []});
    const BIMObjects_positions = await geoAPI.equipment_get_position_multiple(detailedTickets_reduced.BIMObjects.map(e => e.elementSelected.dynamicId));
    const rooms_positions = await geoAPI.room_get_position_multiple(detailedTickets_reduced.rooms.map(e => e.elementSelected.dynamicId));
    return [
        ...mapTicketAndPosition(detailedTickets_reduced.rooms, rooms_positions),
        ...mapTicketAndPosition(detailedTickets_reduced.BIMObjects, BIMObjects_positions)
    ]; 
 }

 export async function filterTicketsOnPosition(tickets: Array<any>, buildingId: string, dynamicId: number): Promise<Array<any>> {
    const ticketsFiltered = tickets.filter((t) => {
        const keys = Object.keys(t.elementSelected?.position);
        for(const key of keys){
            if(t.elementSelected?.position[key]?.dynamicId == dynamicId) return true;
        }
    });
    const positionsXYZ = await nodeAPI.Attribute_list_multiple(ticketsFiltered.map(t => t.elementSelected.dynamicId));
    return mapTicketAndXYZPosition(ticketsFiltered, positionsXYZ);
 }

 function mapTicketAndPosition(ticketTab, positionTab){
    return ticketTab.map(t => {
        const pos = positionTab.find(p => p.dynamicId == t.elementSelected.dynamicId);
        if(pos){
            t.elementSelected.position = pos.info;
        }
        return t;
    });
 }

 function mapTicketAndXYZPosition(ticketTab, XYZTab){
    return ticketTab.map(t => {
        const attributesTab = XYZTab.find( a => a.dynamicId == t.elementSelected.dynamicId);
        if(attributesTab){
            for(const cat of attributesTab.categoryAttributes){
                if(cat.name == "Spatial"){
                    const attribute = cat.attributs.find(attr => attr.label == "XYZ center");
                    t.elementSelected["XYZ center"] = attribute.value;
                    return t;
                }
            }
        }
        return t;
    });
 }

 export function regroupTicketByRoom(ticketTab){
    const returnTab = new Object();
    for(const ticket of ticketTab){
        if(ticket.elementSelected.type == "geographicRoom" || ticket.elementSelected.type == "BIMObject"){
            const dynamicId = ticket.elementSelected.dynamicId;
            if(returnTab[dynamicId]) returnTab[dynamicId].ticketList.push(ticket);
            else{
                returnTab[dynamicId] = {
                    "XYZ center": ticket.elementSelected["XYZ center"],
                    ticketList: [ticket]
                }
            }
        }
    }
    return returnTab;

 }