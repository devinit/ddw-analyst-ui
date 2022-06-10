"""Constants used across the Core app"""
from .models import FrozenData, Operation, SavedQueryData


# Default value for limit if its not specified in the query
DEFAULT_LIMIT_COUNT = 10
DATA_TYPES = {
    'operation': Operation,
    'frozen_table': FrozenData,
    'frozen_dataset': SavedQueryData,
}
