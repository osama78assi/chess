from django.urls import path
from . import views


urlpatterns = [
    path('', views.Index, name='Home'),
    path('alphaL.html', views.AlphaL, name='GameOne'),
    path('alphaBest.html', views.AlphBest, name='GameTwo'),
    path('startL', views.UserTurnL, name='startL'),
    path('getLegalL', views.GetLegalL, name='legalL'),
    path('botFirstL', views.BotTurnL, name='botL'),
    path('isCheckL', views.IsCheckL, name='checkL'),
    path('startB', views.UserTurnB, name='startB'),
    path('getLegalB', views.GetLegalB, name='legalB'),
    path('botFirstB', views.BotTurnB, name='botB'),
    path('isCheckB', views.IsCheckB, name='checkB'),
]
