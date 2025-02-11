from django.db import models
from django.conf import settings
from django.db.models import Q

class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    @classmethod
    def search(cls, user, query=None):
        notes = cls.objects.filter(user=user, is_deleted=False)
        if query:
            notes = notes.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
        return notes

    def soft_delete(self):
        self.is_deleted = True
        self.save()
