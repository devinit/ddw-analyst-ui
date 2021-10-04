from sqlalchemy import distinct, create_engine, MetaData, select, Table
from sqlalchemy.sql import func

DATA_SCHEMA = "repo"
TXNS_TABLE_NAME = "iati_transactions"
PUBLISHERS_TABLE_NAME = "iati_publishers"


def updateIatiPublishersTable():
    engine = create_engine('postgresql://analyst_ui_user:analyst_ui_pass@db:5432/analyst_ui')
    conn = engine.connect()
    meta = MetaData(engine)
    meta.reflect()
    iati_txns_table = Table(TXNS_TABLE_NAME, meta, schema=DATA_SCHEMA, autoload=True)
    publishers_table = Table(PUBLISHERS_TABLE_NAME, meta, schema=DATA_SCHEMA, autoload=True)
    current_publishers_sub_query = select([publishers_table.c.reporting_org_ref])
    select_publishers_not_in_table = select([func.DISTINCT(iati_txns_table.c.reporting_org_ref)]).where(iati_txns_table.c.reporting_org_ref.notin_(current_publishers_sub_query)).group_by(
        iati_txns_table.c.reporting_org_ref,
    )
    conn.execute(publishers_table.insert().from_select(['reporting_org_ref'], select_publishers_not_in_table))

if __name__ == '__main__':
    updateIatiPublishersTable()
