
import { HTTP } from '../http-constants';

/**
 * Retrieves the location details of equipment related to a list of tickets.
 * @param {tickets[]} ticketList - An array of tickets.
 * @returns {Array<{
 *   ticket: string,
 *   location: {
 *     building: string,
 *     floor: string,
 *     room: string
 *   }
 * }>} An array of objects containing ticket IDs and their associated location details.
 */
async function ticket(ticketList) {
  const elementTypes = [
    'geographicBuilding',
    'geographicFloor',
    'geographicRoom',
    'BIMObject',
  ];
  const groupedByType = Object.groupBy(
    ticketList,
    ({ elementSelected }) => elementSelected.type,
  ); 
  // Set the location of tickets by building
  getBuildingPosition(groupedByType);
  // Set the location of tickets by floor
  getFloorPosition(groupedByType);
  console.log('Building grouped:', groupedByType);
}

function getBuildingPosition(group) {
  if (!group.geographicBuilding || !group.geographicBuilding.length) {
    return;
  }
  group.geographicBuilding.forEach( (ticket, index) => {
    group.geographicBuilding[index] = {
      location: { building: ticket.elementSelected.dynamicId },
      ...ticket,
    };
  });
}

async function getFloorPosition(group) {
  if (!group.geographicFloor || !group.geographicFloor.length) {
    return;
  }
  group.geographicFloor.forEach( (ticket, index) => {
    group.geographicFloor[index] = {
      location: {
        floor: ticket.elementSelected.dynamicId,
      },
      ...ticket,
    };
  });
}

const locate = {
  ticket
};

export default locate;

