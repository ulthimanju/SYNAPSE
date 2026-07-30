export const createHealthData = (service, status = 'healthy', version = '1.0.0') => ({
  service,
  status,
  version,
});
