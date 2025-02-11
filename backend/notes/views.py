from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Note
from .serializers import NoteSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notes_list(request):
    if request.method == 'GET':
        query = request.query_params.get('search', '')
        notes = Note.search(request.user, query)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            # Set the user and get the highest position
            max_position = Note.objects.filter(
                user=request.user, 
                is_deleted=False
            ).count()
            
            serializer.save(
                user=request.user,
                position=max_position
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def note_detail(request, pk):
    note = get_object_or_404(Note, pk=pk, user=request.user, is_deleted=False)

    if request.method == 'GET':
        serializer = NoteSerializer(note)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = NoteSerializer(note, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_positions(request):
    positions = request.data
    for item in positions:
        Note.objects.filter(
            id=item['id'],
            user=request.user,
            is_deleted=False
        ).update(position=item['position'])
    return Response(status=status.HTTP_200_OK)
