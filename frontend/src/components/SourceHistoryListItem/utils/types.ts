export interface FrozenData {
  parent_db_table: string;
  frozen_db_table: string | null;
  active: boolean;
  description: string;
  created_on: string;
  user: string;
  status: string;
}
