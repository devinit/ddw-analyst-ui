# Generated by Django 2.2.13 on 2020-09-11 11:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0027_auto_20200911_1032'),
    ]

    operations = [
        migrations.AddField(
            model_name='scheduledevent',
            name='expected_runtime',
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='scheduledevent',
            name='expected_runtime_type',
            field=models.CharField(blank=True, choices=[('min', 'Minutes'), ('sec', 'Seconds'), ('hrs', 'Hours')], max_length=3, null=True),
        ),
    ]
