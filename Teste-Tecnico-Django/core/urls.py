from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    path('admin/', admin.site.site_admin if hasattr(admin, 'site_admin') else admin.site.urls),
    path('api/', include('api.urls')),  # Inclui todas as rotas que criei na pasta api
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    
]