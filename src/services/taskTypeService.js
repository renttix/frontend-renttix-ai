import apiServices from '../../services/apiService';

export const taskTypeService = {
  async getTaskTypes() {
    try {
      const response = await apiService.get('/task-types');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching task types:', error);
      return [];
    }
  },

  async getTaskTypesByCategory(category) {
    try {
      const response = await apiService.get(`/task-types/category/${category}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching task types by category:', error);
      return [];
    }
  },

  async createTaskType(taskType) {
    try {
      const response = await apiService.post('/task-types', taskType);
      return response.data;
    } catch (error) {
      console.error('Error creating task type:', error);
      throw error;
    }
  },

  async updateTaskType(id, taskType) {
    try {
      const response = await apiService.put(`/task-types/${id}`, taskType);
      return response.data;
    } catch (error) {
      console.error('Error updating task type:', error);
      throw error;
    }
  },

  async deleteTaskType(id) {
    try {
      const response = await apiService.delete(`/task-types/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task type:', error);
      throw error;
    }
  }
};