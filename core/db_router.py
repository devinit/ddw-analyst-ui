class CoreRouter:
    """
    A router to control all database operations on models in the
    core application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read core models go to default db.
        """
        return 'default'

    def db_for_write(self, model, **hints):
        """
        Attempts to write core models go to default db.
        """
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Relations between objects are allowed if both objects are
        in default.
        """
        db_list = ('default')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        All non-datasets requests go here.
        """
        return True
