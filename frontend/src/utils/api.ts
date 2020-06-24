export const api = {
  routes: {
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    USERS: '/api/users/',
    SOURCES: '/api/sources/',
    OPERATIONS: '/api/operations/',
    MY_OPERATIONS: '/api/operations/mine/',
    EXPORT: '/api/export/',
    CHANGE_PASSWORD: '/api/change_password/',
    VIEW_SCHEDULED_EVENTS: '/api/scheduled_event/',
    FETCH_RUN_INSTANCES: '/api/scheduled_event/{id}/run_instances/',
    CREATE_SCHEDULED_INSTANCE: '/api/scheduled_event/{scheduleId}/run_instances/',
    UPDATE_TABLE: '/api/tables/update/',
    DOWNLOAD_TABLE: '/api/tables/download/',
  },
};
