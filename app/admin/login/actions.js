'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(formData) {
  const passwordIngresada = formData.get('password');
  const passwordReal = process.env.ADMIN_PASSWORD;

  if (passwordIngresada === passwordReal) {
    const cookieStore = await cookies();
    
    cookieStore.set('admin_token', 'autenticado', {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  } else {
    return { error: 'Contraseña incorrecta ❌' };
  }

  redirect('/admin');
}