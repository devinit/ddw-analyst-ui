# Generated by Django 2.1.7 on 2019-04-10 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_auto_20190409_1200'),
    ]

    operations = [
        migrations.AddField(
            model_name='sourcecolumnmap',
            name='data_type',
            field=models.CharField(blank=True, choices=[('C', 'Character'), ('N', 'Numeric')], max_length=1, null=True),
        ),
    ]
