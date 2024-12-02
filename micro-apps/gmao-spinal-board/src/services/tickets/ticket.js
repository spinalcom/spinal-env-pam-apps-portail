
import { HTTP } from '../http-constants';

async function getMultipleTickets(bid, stepList) {
  const ticketList = await HTTP
    .post(`/building/${bid}/node/ticket_list_multiple`, [74206624]);
  console.log(ticketList);
}

async function getTickets(bid, stepList) {
  try {
    await getMultipleTickets(bid, []);
    return []
  } catch (error) {

    return []
  }
}

const ticket = {
  getTickets,
};

export default ticket;

