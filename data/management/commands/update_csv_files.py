from django.core.management.base import BaseCommand, CommandError
from core.models import Source, UpdateHistory
import json
from github import Github
# import urllib2
import urllib.request


class Command(BaseCommand):
    help = 'Downloads updated CSV files from git repo'

    def handle(self, *args, **options):
        try:
            g = Github("b53b02ac10a5f73e6c9ea4bdb7ad2cc2533fa09c")

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
