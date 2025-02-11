from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'position', 'created_at', 'is_deleted')
    list_filter = ('is_deleted', 'user')
    search_fields = ('title', 'content')
    ordering = ('user', 'position')
    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        # Show all notes in admin, including soft-deleted ones
        return super().get_queryset(request)
