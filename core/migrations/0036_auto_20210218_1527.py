# Generated by Django 3.1 on 2021-02-18 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0035_operation_alias_creation_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='operation',
            name='alias_creation_status',
            field=models.TextField(choices=[('d', 'Done'), ('p', 'Pending'), ('e', 'Error')], default='d'),
        ),
    ]
