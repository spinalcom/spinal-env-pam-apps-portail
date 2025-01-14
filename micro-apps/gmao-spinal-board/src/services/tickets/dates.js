
import { HTTP } from '../http-constants';
import { chunkArray } from './utils.js';

async function getAttributes(bid, ticketList) {
  const ticketIds = ticketList.map(ticket => ticket.ticketId);

  const ticketChunks = chunkArray(ticketIds);

  const chunkPromises = ticketChunks.map(async chunk => {
    const attributeList = await HTTP
      .post(`/building/${bid}/node/attribute_list_multiple`, chunk);
    return attributeList.data;
  });

  const attributeList = await Promise.all(chunkPromises);
  const flatAttributeList = attributeList.flat();
  mapDates(ticketList, flatAttributeList);
}

function mapDates(ticketList, attributeList) {
  const dateAttributes = [
    'startDate',
    'endDate',
    'estimatedStartDate',
    'estimatedEndDate',
    'string',
  ];
  return ticketList.map(ticket => {
    const attributes = attributeList
      .find(a => a.dynamicId === ticket.ticketId).categoryAttributes
      .find(a => a.name === 'default').attributs
      .filter(a => dateAttributes.includes(a.label))
      .reduce((acc, a) => {
        acc[a.label] = a.value;
        return acc;
      }, {});
    ticket.startDate = attributes.startDate || null;
    ticket.endDate = attributes.endDate || null;
    ticket.estimatedStartDate = attributes.estimatedStartDate || null;
    ticket.estimatedEndDate = attributes.estimatedEndDate || null;
    ticket.string = attributes.string || null;
  });
}

/**
  * Get the category ID of a ticket.
  * By default the category name is 'default'.
  * @param {string} bid Building ID
  * @param {string} tid Ticket ID
  * @param {string} categoryName Category name
  */
async function getCategoryId(bid, tid, categoryName = 'default') {
  const categoryList = await HTTP.get(`/building/${bid}/node/${tid}/categoriesList`);
  const categoryId = categoryList.data.find(c => c.name === categoryName).dynamicId;
  return categoryId;
}

/**
  * Set the estimated start date of a ticket.
  * if the attribute does not exist, it will be created
  * if the attribute exists, it will be updated
  * @param {string} tid Ticket ID
  * @param {string} date Date in milliseconds
  */
async function setEstimatedStart(tid, date) {
  const bid = localStorage.getItem('idBuilding');
  const attribute = {
    attributeLabel: 'estimatedStartDate',
    attributeValue: date,
    attributeType: 'date',
    attributeUnit: 'ms',
  };
  await createAttribute(tid, attribute);
}

/**
  * Set the estimated end date of a ticket.
  * if the attribute does not exist, it will be created.
  * if the attribute exists, it will be updated.
  * @param {string} tid Ticket ID
  * @param {string} date Date in milliseconds
  */
async function setEstimatedEnd(tid, date) {
  const bid = localStorage.getItem('idBuilding');
  const attribute = {
    attributeLabel: 'estimatedEndDate',
    attributeValue: date,
    attributeType: 'date',
    attributeUnit: 'ms',
  };
  await createAttribute(tid, attribute);
}

/**
  * Create attribute for a node.
  * @param {string} tid Ticket ID
  * @param {object} attribute Attribute object
  */
async function createAttribute(tid, attribute) {
  const bid = localStorage.getItem('idBuilding');
  try {
    const categoryID = await getCategoryId(bid, tid);
    await HTTP.post(`/building/${bid}/node/${tid}/category/${categoryID}/attribut/create`, attribute);
  } catch (error) {
    console.error('Error creating attribute', error);
  }
}

const dates = {
  getAttributes,
  setEstimatedStart,
  setEstimatedEnd,
};

export default dates;
