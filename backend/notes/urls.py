from django.urls import path
from . import views

urlpatterns = [
    path('', views.notes_list, name='notes-list'),
    path('<int:pk>/', views.note_detail, name='note-detail'),
    path('positions/', views.update_positions, name='update-positions'),
]
