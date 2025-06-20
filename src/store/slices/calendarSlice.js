import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import calendarService from '../../services/calendarService';

// Async thunks
export const fetchCalendarData = createAsyncThunk(
  'calendar/fetchData',
  async ({ startDate, endDate }) => {
    const [jobs, routes] = await Promise.all([
      calendarService.fetchJobsForDateRange(startDate, endDate),
      calendarService.fetchRoutes()
    ]);
    return { jobs, routes };
  }
);

export const updateJobAssignment = createAsyncThunk(
  'calendar/updateAssignment',
  async ({ jobId, routeId, date, previousRouteId, previousDate }) => {
    // Validate assignment first
    const validation = await calendarService.validateAssignment(jobId, routeId, date);
    if (!validation.isValid) {
      throw new Error(validation.message || 'Invalid assignment');
    }
    
    const result = await calendarService.updateJobAssignment(jobId, {
      routeId,
      date: date.toISOString()
    });
    
    return {
      jobId,
      routeId,
      date: date.toISOString(),
      previousRouteId,
      previousDate,
      job: result.job
    };
  }
);

export const reassignDriver = createAsyncThunk(
  'calendar/reassignDriver',
  async ({ jobId, driverId }) => {
    const result = await calendarService.reassignDriver(jobId, driverId);
    return { jobId, driverId, job: result.job };
  }
);

export const markJobOffHire = createAsyncThunk(
  'calendar/markOffHire',
  async ({ jobId, offHireDate }) => {
    const result = await calendarService.markOffHire(jobId, offHireDate);
    return { jobId, job: result.job };
  }
);

const initialState = {
  jobs: {},
  routes: [],
  selectedDateRange: {
    start: new Date(),
    end: new Date()
  },
  viewMode: 'week', // 'day', 'week', 'month'
  filters: {
    routes: [],
    jobTypes: [],
    status: []
  },
  draggedJob: null,
  hoveredCell: null,
  loading: false,
  error: null,
  optimisticUpdates: {}
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setDraggedJob: (state, action) => {
      state.draggedJob = action.payload;
    },
    setHoveredCell: (state, action) => {
      state.hoveredCell = action.payload;
    },
    // Optimistic update for drag operations
    optimisticMoveJob: (state, action) => {
      const { jobId, fromRouteId, toRouteId, fromDate, toDate } = action.payload;
      const job = state.jobs[jobId];
      
      if (job) {
        // Store original position for rollback
        state.optimisticUpdates[jobId] = {
          originalRouteId: fromRouteId,
          originalDate: fromDate
        };
        
        // Update job position
        job.routeId = toRouteId;
        job.date = toDate;
      }
    },
    rollbackOptimisticUpdate: (state, action) => {
      const jobId = action.payload;
      const original = state.optimisticUpdates[jobId];
      
      if (original && state.jobs[jobId]) {
        state.jobs[jobId].routeId = original.originalRouteId;
        state.jobs[jobId].date = original.originalDate;
        delete state.optimisticUpdates[jobId];
      }
    },
    clearOptimisticUpdate: (state, action) => {
      const jobId = action.payload;
      delete state.optimisticUpdates[jobId];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch calendar data
      .addCase(fetchCalendarData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarData.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload.routes;
        
        // Convert jobs array to object keyed by ID
        state.jobs = {};
        action.payload.jobs.forEach(job => {
          state.jobs[job._id] = job;
        });
      })
      .addCase(fetchCalendarData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update job assignment
      .addCase(updateJobAssignment.fulfilled, (state, action) => {
        const { jobId, job } = action.payload;
        state.jobs[jobId] = job;
        state.clearOptimisticUpdate(jobId);
      })
      .addCase(updateJobAssignment.rejected, (state, action) => {
        // Rollback optimistic update on failure
        const jobId = action.meta.arg.jobId;
        state.rollbackOptimisticUpdate(jobId);
        state.error = action.error.message;
      })
      
      // Reassign driver
      .addCase(reassignDriver.fulfilled, (state, action) => {
        const { jobId, job } = action.payload;
        state.jobs[jobId] = job;
      })
      
      // Mark off-hire
      .addCase(markJobOffHire.fulfilled, (state, action) => {
        const { jobId, job } = action.payload;
        state.jobs[jobId] = job;
      });
  }
});

export const {
  setDateRange,
  setViewMode,
  setFilters,
  setDraggedJob,
  setHoveredCell,
  optimisticMoveJob,
  rollbackOptimisticUpdate,
  clearOptimisticUpdate
} = calendarSlice.actions;

export default calendarSlice.reducer;

// Selectors
export const selectJobs = (state) => state.calendar.jobs;
export const selectRoutes = (state) => state.calendar.routes;
export const selectDateRange = (state) => state.calendar.selectedDateRange;
export const selectViewMode = (state) => state.calendar.viewMode;
export const selectFilters = (state) => state.calendar.filters;
export const selectDraggedJob = (state) => state.calendar.draggedJob;
export const selectHoveredCell = (state) => state.calendar.hoveredCell;
export const selectCalendarLoading = (state) => state.calendar.loading;
export const selectCalendarError = (state) => state.calendar.error;

// Filtered jobs selector
export const selectFilteredJobs = (state) => {
  const jobs = selectJobs(state);
  const filters = selectFilters(state);
  
  return Object.values(jobs).filter(job => {
    if (filters.routes.length > 0 && !filters.routes.includes(job.routeId)) {
      return false;
    }
    if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.type)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(job.status)) {
      return false;
    }
    return true;
  });
};