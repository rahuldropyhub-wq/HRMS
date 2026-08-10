import { supabase } from '../../config/supabase';

export class ExtensionRepository {
  async registerDevice(deviceData: any) {
    const { data, error } = await supabase
      .from('extension_devices')
      .upsert(deviceData, { onConflict: 'device_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getActiveSession(attendanceId: string, employeeId: string) {
    const { data, error } = await supabase
      .from('extension_sessions')
      .select('*')
      .eq('attendance_id', attendanceId)
      .eq('employee_id', employeeId)
      .is('ended_at', null)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createSession(sessionData: any) {
    const { data, error } = await supabase
      .from('extension_sessions')
      .insert(sessionData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSession(sessionId: string, status: string, endedAt?: string) {
    const updatePayload: any = { status };
    if (endedAt) updatePayload.ended_at = endedAt;

    const { data, error } = await supabase
      .from('extension_sessions')
      .update(updatePayload)
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateEmployeeActivity(activityData: any) {
    const { data, error } = await supabase
      .from('employee_activity')
      .upsert(activityData, { onConflict: 'employee_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async logHeartbeat(heartbeatData: any) {
    const { data, error } = await supabase
      .from('heartbeat_logs')
      .insert(heartbeatData);
    if (error) throw error;
    return data;
  }

  async createIdleHistory(idleData: any) {
    const { data, error } = await supabase
      .from('employee_idle_history')
      .insert(idleData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
