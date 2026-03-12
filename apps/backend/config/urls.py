from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/sessions/', include('apps.clinical_sessions.urls')),
    path('api/v1/scales/', include('apps.scales.urls')),
    path('api/v1/transcription/', include('apps.transcription.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]
