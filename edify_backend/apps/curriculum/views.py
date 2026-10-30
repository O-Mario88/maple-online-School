# Curriculum reads (countries, levels, subjects, topics, competencies and the
# catalog tree) are served by the Go API. Resource reviews stay here until the
# resources module moves.
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ResourceQualityReview
from .serializers import ResourceQualityReviewSerializer


class ResourceQualityReviewViewSet(viewsets.ModelViewSet):
    """
    Moderation queue allowing NCDC or Admin validators to approve platform teaching resources.
    """
    queryset = ResourceQualityReview.objects.all()
    serializer_class = ResourceQualityReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        review = self.get_object()
        score = request.data.get('compliance_score', 100)
        review.status = 'approved'
        review.compliance_score = score
        review.reviewer_notes = request.data.get('notes', 'Passes Quality Assurance.')
        review.save()
        return Response({'status': 'approved'})
