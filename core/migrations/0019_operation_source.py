# Generated by Django 2.2.13 on 2020-08-09 04:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_scheduledeventruninstance_logs'),
    ]

    operations = [
        migrations.AddField(
            model_name='operation',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='operations', to='core.Source'),
        ),
    ]
