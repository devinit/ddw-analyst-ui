from django import forms
from django.utils.translation import gettext as _
from .models import ETLQuery, SavedQueryData

class ETLQueryForm(forms.ModelForm):

    class Meta:
        model = ETLQuery
        fields = ['query', 'etl_process', 'saved_dataset', 'active', 'user']


    def clean(self):
        cleaned_data = self.cleaned_data
        query_id = cleaned_data['query']
        if query_id:
            saved_query_set = SavedQueryData.objects.filter(operation=query_id).order_by('-id').first()
            etlquery = ETLQuery.objects.get(saved_dataset=saved_query_set)
            if etlquery:

                raise forms.ValidationError(
                    _('Item %(value)s already uses this dataset. Rectify error to continue'),
                    params = {'value': etlquery},
                )
        return cleaned_data
