import {
  GetDashboardStatsInput,
  GetOverdueInvoicesInput,
  GetRecentActivityInput,
  GetRevenueChartDataInput,
} from "../validators/dashboardSchema";

export class DashboardService {
  /**
   * Aylık gelir, toplam saat gibi ana metrikleri getirir.
   */
  static async getDashboardStats(
    userId: string,
    query: GetDashboardStatsInput,
  ): Promise<any> {
    // TODO: implement
    return {};
  }

  /**
   * Gelir grafiği için veriyi sağlar.
   */
  static async getRevenueChartData(
    userId: string,
    query: GetRevenueChartDataInput,
  ): Promise<any> {
    // TODO: implement
    return [];
  }

  /**
   * Son yapılan işlemleri listeler.
   */
  static async getRecentActivity(
    userId: string,
    query: GetRecentActivityInput,
  ): Promise<any[]> {
    // TODO: implement
    return [];
  }

  /**
   * Vadesi geçmiş faturaları uyarı olarak döndürür.
   */
  static async getOverdueInvoices(
    userId: string,
    query: GetOverdueInvoicesInput,
  ): Promise<any[]> {
    // TODO: implement
    return [];
  }
}
