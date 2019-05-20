from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'frontend/index.html')

def with_id(request, pk):
    return index(request)
