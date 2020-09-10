from django.shortcuts import render
from django.conf import settings
from django.http import Http404

# Create your views here.
def index(request):
    return render(request, 'frontend/index.html', { 'DEBUG': settings.DEBUG })

def with_id(request, pk):
    return index(request)

def scheduled_events(request):
    if settings.DEBUG:
        return render(request, 'frontend/designs/scheduled_events.html')

    raise Http404()

def update_data_source(request):
    if settings.DEBUG:
        return render(request, 'frontend/designs/update_data_source.html')

    raise Http404()

def datasets(request):
    if settings.DEBUG:
        sources = [
            'Financial Tracking System (FTS)',
            'OECD DAC1',
            'OECD Creditor Reporting System (CRS)',
            'International Aid Transparency Initiative Transactions (IATI)',
            'World Development Indicators (WDI)'
        ]
        return render(request, 'frontend/designs/datasets.html', { 'sources': sources })
