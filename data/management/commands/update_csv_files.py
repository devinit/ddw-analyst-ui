from django.core.management.base import BaseCommand, CommandError
from github import Github
import urllib.request
from django.conf import settings


class Command(BaseCommand):
    help = 'Downloads CSV files from git repo'

    def handle(self, *args, **options):
        try:
            g = Github(settings.GITHUB_TOKEN)

            repo = g.get_repo("devinit/ddw-data-update-configs")
            contents = repo.get_contents("manual")
            while contents:
                file_content = contents.pop(0)
                if file_content.type == "dir":
                    contents.extend(repo.get_contents(file_content.path))
                else:
                    urllib.request.urlretrieve(file_content.download_url, "./data_updates/"+file_content.path)
            
        except Exception as e:
            raise CommandError(e)
