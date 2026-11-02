/**
 * Report API — Django REPORT_BASE_URL (reportApi).
 * Ported from AlgoHopperBot ReportService.
 */

import { reportApi } from "./clients";
import { apiRequest } from "./helper";
import { CONSTANTS } from "@/lib/constants";

export const reportApiService = {
  list: (params: Record<string, unknown> = {}) =>
    reportApi.get(CONSTANTS.API.REPORT.GET_REPORTS, { params }).then((r) => r.data),

  add: (data: Record<string, unknown>) =>
    reportApi.post(CONSTANTS.API.REPORT.ADD_REPORT, data).then((r) => r.data),

  update: (data: Record<string, unknown>) =>
    reportApi.put(CONSTANTS.API.REPORT.UPDATE_REPORT, data).then((r) => r.data),

  deleteReport: (reportId: string) =>
    reportApi.delete(CONSTANTS.API.REPORT.DELETE_REPORT, { params: { report_id: reportId } }).then((r) => r.data),

  update_status: (data: Record<string, unknown>) =>
    reportApi.put(CONSTANTS.API.REPORT.UPDATE_STATUS, data).then((r) => r.data),

  get_report_data: (reportId: string, date: string) =>
    reportApi.get(CONSTANTS.API.REPORT.GET_REPORT_DATA, { params: { report_id: reportId, date } }).then((r) => r.data),

  update_report_data: (data: Record<string, unknown>) =>
    reportApi.put(CONSTANTS.API.REPORT.UPDATE_REPORT_DATA, data).then((r) => r.data),

  generate_report: (reportId: string, date: string, force: boolean = false) =>
    reportApi.get(CONSTANTS.API.REPORT.GENERATE_REPORT, { params: { report_id: reportId, date, force: force ? 1 : 0 } }).then((r) => r.data),

  download_report: (reportId: string, date: string) =>
    reportApi.get(CONSTANTS.API.REPORT.DOWNLOAD_REPORT, {
      params: { report_id: reportId, date },
      responseType: "blob",
    }).then((r) => r.data as Blob),
};
