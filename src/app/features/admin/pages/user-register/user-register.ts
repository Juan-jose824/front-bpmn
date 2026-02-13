import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-register.html',
  styleUrl: './user-register.scss',
})
export class UserRegister implements OnInit {
  registerForm: FormGroup

  registeredUsers = [
    {name: '', email: '', role: '', date: ''}
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {}
      
    onRegister() {
      if (this.registerForm.valid) {
        console.log('Datos del nuevo usuario:', this.registerForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/analisis']);
  }
  
}
