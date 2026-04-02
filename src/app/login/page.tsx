import LoginForm from "./LoginForm";
import { Droplet } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-slate-50">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] rounded-full bg-green-50 blur-3xl opacity-60 pointer-events-none" />

      <main className="w-full max-w-sm px-6 py-10 z-10 mx-auto bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl sm:rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
            <Droplet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Kuppipaal.com</h1>
          <p className="text-slate-500 text-sm mt-1">Delivery Management System</p>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-xs text-slate-400">
          Secure Access System &copy; {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
