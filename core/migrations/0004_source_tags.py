# Generated by Django 2.1.7 on 2019-03-06 15:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20190306_0039'),
    ]

    operations = [
        migrations.AddField(
            model_name='source',
            name='tags',
            field=models.ManyToManyField(to='core.Tag'),
        ),
    ]
