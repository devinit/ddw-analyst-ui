# Generated by Django 3.2.11 on 2022-02-10 09:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0043_auto_20220128_0728'),
    ]

    operations = [
        migrations.AlterField(
            model_name='etlquery',
            name='etl_process',
            field=models.CharField(choices=[('IATI', 'IATI Data'), ('FTS', 'FTS Data'), ('Others', 'Others')], max_length=20),
        ),
    ]