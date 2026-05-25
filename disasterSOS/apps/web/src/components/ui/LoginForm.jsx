import React from 'react';
export default function LoginForm() {
  return (
    <form className="p-6 bg-slate-900 rounded-xl space-y-4">
      <input type="email" placeholder="Email" className="w-full p-2 bg-slate-800 rounded border border-slate-700" />
      <input type="password" placeholder="Password" className="w-full p-2 bg-slate-800 rounded border border-slate-700" />
      <button type="submit" className="w-full p-2 bg-blue-600 rounded font-semibold text-white">Login</button>
    </form>
  );
}
