export interface FrozenData {
  id: number;
  parent_db_table: string;
  frozen_db_table: string | null;
  active: boolean;
  description: string;
  created_on: string;
  user: string;
  status: string;
  logs: string | null;
}
