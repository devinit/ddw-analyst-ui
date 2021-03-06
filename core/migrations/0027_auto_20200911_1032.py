# Generated by Django 2.2.13 on 2020-09-11 10:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_remove_operation_source'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('message', models.TextField(blank=True, null=True)),
                ('platform', models.CharField(blank=True, choices=[('ml', 'email')], max_length=255, null=True)),
            ],
        ),
        migrations.AddField(
            model_name='scheduledevent',
            name='alert',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core.Alert'),
        ),
    ]
