from ddw_analyst_ui.settings import *

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'analyst_ui',
        'USER': 'analyst_ui_user',
        'PASSWORD': 'analyst_ui_pass',
        'HOST': 'db',
        'PORT': 5432,
    },
    'datasets': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'analyst_ui',
        'USER': 'analyst_ui_user',
        'PASSWORD': 'analyst_ui_pass',
        'HOST': 'db',
        'PORT': 5432,
        'OPTIONS': {
            'options': '-c search_path=repo,archives,dataset' # Add future non-public schemas here
        },
        'TEST': {
            'MIRROR': 'default'
        }
    }
}
