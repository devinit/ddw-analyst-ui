export interface SavedQueryData {
  id: number;
  saved_query_db_table: string;
  operation: number;
  full_query: string | null;
  active: boolean;
  description: string;
  created_on: string;
  user: string;
  status: string;
}
