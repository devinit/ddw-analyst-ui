# Generated by Django 2.1.7 on 2019-05-23 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_sourcecolumnmap_data_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='updatehistory',
            name='invalidated_on',
        ),
        migrations.RemoveField(
            model_name='updatehistory',
            name='invalidation_description',
        ),
        migrations.RemoveField(
            model_name='updatehistory',
            name='is_major_release',
        ),
        migrations.AlterField(
            model_name='updatehistory',
            name='history_table',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='updatehistory',
            name='released_on',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
