# Generated by Django 2.2.10 on 2020-06-01 13:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_auto_20200518_1345'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduledeventruninstance',
            name='status',
            field=models.CharField(choices=[('p', 'Pending'), ('r', 'Running'), ('c', 'Completed'), ('e', 'Erroed'), ('s', 'Skipped')], default='p', max_length=1),
        ),
    ]
