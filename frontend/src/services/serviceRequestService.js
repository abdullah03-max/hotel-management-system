import axios from 'axios';

const API_URL = 'http://localhost:5000/api/service-requests';

export const serviceRequestService = {
  getServiceRequests: async () => {
    const response = await axios.get(API_URL);
    return response;
  },
  createServiceRequest: async (data) => {
    const response = await axios.post(API_URL, data);
    return response;
  }
};
