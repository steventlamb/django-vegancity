from django.http import HttpResponse
from django.shortcuts import render_to_response, render

import models

def home(request):
    return render_to_response('vegancity/home.html')

def search(request):
    return render_to_response('vegancity/search.html')

def spread(request):
    return render_to_response('vegancity/spread.html')

def about(request):
    return render_to_response('vegancity/about.html')