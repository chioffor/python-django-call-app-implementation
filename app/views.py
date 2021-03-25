from nanoid import generate

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User

from .forms import LoginForm, RegisterForm
# Create your views here.

def getContext(request):
    users = User.objects.all()
    context = {
        'users': users,
        'user_id': request.user.id,
        'current_user': request.user
    }
    return context


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        username = form.request.get('username')
        password = form.request.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/')
    else:
        form = LoginForm()

    return render(request, 'index.html', {'form': form})


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password1 = form.cleaned_data['password1']

            User.objects.create_user(username=username, password=password1)

            return redirect('login')

    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


def connect(request):
    if request.user.is_authenticated:
        context = getContext(request)
        return render(request, 'contacts.html', context)
    else:
        return redirect('login')