from django.core.management.base import BaseCommand, CommandError
from core.models import Source, UpdateHistory


class Command(BaseCommand):
    help = 'Updates metadata when an automated dataset gets updated'

    def add_arguments(self, parser):
        parser.add_argument('active_mirror_name', nargs='?', type=str)
        parser.add_argument('release_description', nargs='?', type=str, default="Automated update.")

    def handle(self, *args, **options):
        try:
            source = Source.objects.get(active_mirror_name=options["active_mirror_name"])
        except Source.DoesNotExist:
            raise CommandError("Mirror '" + options["active_mirror_name"] + "' does not Exist")
        source.save()  # Update last_updated_on
        update_history = UpdateHistory(
            source=source,
            release_description=options["release_description"]
        )
        update_history.save()
