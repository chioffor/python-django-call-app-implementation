from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django import forms

# from .models import EmailUser


class LoginForm(AuthenticationForm):
    username = forms.CharField(max_length=150, label='', widget=forms.TextInput(
        attrs={
            'placeholder': 'username',
            'class': 'mt-2 form-control',

        }
    ))
    password = forms.CharField(label="", widget=forms.PasswordInput(
        attrs={
            'placeholder': 'password',
            'class': 'mt-2 form-control',
        }
    ))


class RegisterForm(UserCreationForm):
    username = forms.CharField(max_length=150, label='', widget=forms.TextInput(
        attrs={
            'placeholder': 'username',
            'class': 'mt-2 form-control',
            'name': 'username',
        }
    ))
    password1 = forms.CharField(label="", widget=forms.PasswordInput(
        attrs={
            'placeholder': 'password',
            'class': 'mt-2 form-control'
        }
    ))
    password2 = forms.CharField(label="", widget=forms.PasswordInput(
        attrs={
            'placeholder': 'confirm password',
            'class': 'mt-2 form-control'
        }
    ))