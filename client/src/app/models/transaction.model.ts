export interface Transaction {
  amount: number;
  day: number;
  merchant: string;
  month: number;
  year: number;
  category: string;
  monthName?: string;
}
