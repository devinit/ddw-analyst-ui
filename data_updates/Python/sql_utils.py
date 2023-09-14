from sqlalchemy import MetaData, Table, Column, insert, text, inspect
from pandas._libs import lib
from pandas.core.common import standardize_mapping
from pandas.core.dtypes.cast import maybe_box_native


def dataframe_records_gen(df_):
    columns = df_.columns.tolist()
    into_c = standardize_mapping(dict)

    for row in df_.itertuples(index=False, name=None):
        yield into_c(
            (k, maybe_box_native(v)) for k, v in dict(zip(columns, row)).items()
        )


def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx:min(ndx + n, l)]


def sqlalchemy_type(col):

    # Infer type of column, while ignoring missing values.
    # Needed for inserting typed data containing NULLs, GH 8778.
    col_type = lib.infer_dtype(col, skipna=True)

    from sqlalchemy.types import (
        TIMESTAMP,
        BigInteger,
        Boolean,
        Date,
        DateTime,
        Float,
        Integer,
        SmallInteger,
        Text,
        Time,
    )

    if col_type in ("datetime64", "datetime"):
        # GH 9086: TIMESTAMP is the suggested type if the column contains
        # timezone information
        try:
            # error: Item "Index" of "Union[Index, Series]" has no attribute "dt"
            if col.dt.tz is not None:  # type: ignore[union-attr]
                return TIMESTAMP(timezone=True)
        except AttributeError:
            # The column is actually a DatetimeIndex
            # GH 26761 or an Index with date-like data e.g. 9999-01-01
            if getattr(col, "tz", None) is not None:
                return TIMESTAMP(timezone=True)
        return DateTime
    if col_type == "timedelta64":
        return BigInteger
    elif col_type == "floating":
        if col.dtype == "float32":
            return Float(precision=23)
        else:
            return Float(precision=53)
    elif col_type == "integer":
        # GH35076 Map pandas integer to optimal SQLAlchemy integer type
        if col.dtype.name.lower() in ("int8", "uint8", "int16"):
            return SmallInteger
        elif col.dtype.name.lower() in ("uint16", "int32"):
            return Integer
        elif col.dtype.name.lower() == "uint64":
            raise ValueError("Unsigned 64 bit integer datatype is not supported")
        else:
            return BigInteger
    elif col_type == "boolean":
        return Boolean
    elif col_type == "date":
        return Date
    elif col_type == "time":
        return Time
    elif col_type == "complex":
        raise ValueError("Complex datatypes not supported")

    return Text

def get_column_names_and_types(frame, dtype_mapper):
    column_names_and_types = []

    column_names_and_types += [
        (str(frame.columns[i]), dtype_mapper(frame.iloc[:, i]))
        for i in range(len(frame.columns))
    ]

    return column_names_and_types


def df_to_sql(df, engine, table_name, schema, if_exists="append", batch_size=50):
    meta = MetaData()
    meta.reflect(engine)
    inspector = inspect(engine)

    table_dropped = False
    table_exists = inspector.has_table(table_name, schema=schema)
    if table_exists and if_exists == "replace":
        drop_command = text('DROP TABLE "{}"."{}"'.format(schema, table_name))
        with engine.begin() as conn:
            conn.execute(drop_command)
        table_dropped = True

    if not table_exists or table_dropped:
        columns = [Column(desc[0], desc[1]) for desc in get_column_names_and_types(df, sqlalchemy_type)]
        table = Table(table_name, meta, schema=schema, *columns)
        table.create(engine)
    else:
        table = Table(table_name, meta, schema=schema, autoload_with=engine)

    records = dataframe_records_gen(df)
    record_batches = batch(records, batch_size)
    for record_batch in record_batches:
        with engine.begin() as conn:
            conn.execute(
                insert(table).values(
                    record_batch
                )
            )
