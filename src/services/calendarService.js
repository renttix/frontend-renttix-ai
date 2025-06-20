import apiService from './apiService';

const calendarService = {
  // Fetch jobs for a specific date range
  fetchJobsForDateRange: async (startDate, endDate) => {
    try {
      const response = await apiService.get('/api/calendar/jobs', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar jobs:', error);
      throw error;
    }
  },

  // Fetch all routes with their capacities
  fetchRoutes: async () => {
    try {
      const response = await apiService.get('/api/routes');
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },

  // Update job assignment (route and date)
  updateJobAssignment: async (jobId, updates) => {
    try {
      const response = await apiService.put(`/api/calendar/jobs/${jobId}/assign`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating job assignment:', error);
      throw error;
    }
  },

  // Reassign job to different driver
  reassignDriver: async (jobId, driverId) => {
    try {
      const response = await apiService.put(`/api/calendar/jobs/${jobId}/driver`, {
        driverId
      });
      return response.data;
    } catch (error) {
      console.error('Error reassigning driver:', error);
      throw error;
    }
  },

  // Mark job as off-hire
  markOffHire: async (jobId, offHireDate) => {
    try {
      const response = await apiService.put(`/api/calendar/jobs/${jobId}/off-hire`, {
        offHireDate
      });
      return response.data;
    } catch (error) {
      console.error('Error marking job as off-hire:', error);
      throw error;
    }
  },

  // Get route capacity for a specific date
  getRouteCapacity: async (routeId, date) => {
    try {
      const response = await apiService.get(`/api/routes/${routeId}/capacity`, {
        params: { date: date.toISOString() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching route capacity:', error);
      throw error;
    }
  },

  // Validate if job can be assigned to route/date
  validateAssignment: async (jobId, routeId, date) => {
    try {
      const response = await apiService.post('/api/calendar/validate-assignment', {
        jobId,
        routeId,
        date: date.toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error validating assignment:', error);
      throw error;
    }
  },

  // Batch update multiple jobs
  batchUpdateJobs: async (updates) => {
    try {
      const response = await apiService.post('/api/calendar/jobs/batch-update', {
        updates
      });
      return response.data;
    } catch (error) {
      console.error('Error batch updating jobs:', error);
      throw error;
    }
  }
};

export default calendarService;