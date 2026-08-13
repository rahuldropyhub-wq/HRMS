import { ExtensionRepository } from './extension.repository';

export class ExtensionService {
  private repository: ExtensionRepository;

  constructor() {
    this.repository = new ExtensionRepository();
  }

  async handleHeartbeat(payload: any) {
    const { employeeId, attendanceId, deviceId, status, latency } = payload;
    
    // Log the heartbeat
    await this.repository.logHeartbeat({
      employee_id: employeeId,
      device_id: deviceId,
      status,
      latency_ms: latency
    });

    // Update live activity
    await this.repository.updateEmployeeActivity({
      employee_id: employeeId,
      current_status: status,
      last_heartbeat: new Date().toISOString(),
      device_id: deviceId
    });

    return { success: true, timestamp: new Date().toISOString() };
  }

  async handleStatusChange(payload: any) {
    const { employeeId, attendanceId, status, deviceId } = payload;
    
    await this.repository.updateEmployeeActivity({
      employee_id: employeeId,
      current_status: status,
      last_heartbeat: new Date().toISOString(),
      device_id: deviceId
    });

    return { success: true, status };
  }

  async handleIdleStart(payload: any) {
    const { employeeId, attendanceId } = payload;
    
    await this.repository.createIdleHistory({
      employee_id: employeeId,
      attendance_id: attendanceId,
      idle_start: new Date().toISOString()
    });

    await this.handleStatusChange({ ...payload, status: 'Idle' });
    return { success: true };
  }
}
