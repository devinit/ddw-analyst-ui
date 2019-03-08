class DataRouter:
    """
    A router to control all database operations on models in the
    data application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read data models go to datasets db.
        """
        if model._meta.app_label == 'data':
            return 'datasets'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write data models go to datasets db.
        """
        if model._meta.app_label == 'data':
            return 'datasets'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the data app is involved.
        """
        if obj1._meta.app_label == 'data' or \
           obj2._meta.app_label == 'data':
           return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the data app only appears in the 'datasets'
        database.
        """
        if app_label == 'data':
            return db == 'datasets'
        return None
