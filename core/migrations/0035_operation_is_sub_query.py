# Generated by Django 2.2.13 on 2020-11-11 12:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0034_savedquerydata_logs'),
    ]

    operations = [
        migrations.AddField(
            model_name='operation',
            name='is_sub_query',
            field=models.BooleanField(default=False),
        ),
    ]