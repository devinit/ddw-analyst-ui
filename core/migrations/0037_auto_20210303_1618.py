# Generated by Django 3.1 on 2021-03-03 16:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0036_auto_20210303_1617'),
    ]

    operations = [
        migrations.AlterField(
            model_name='operation',
            name='logs',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AlterField(
            model_name='operationstep',
            name='logs',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]
