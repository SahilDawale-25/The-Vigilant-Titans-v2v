"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-0 shrink-0">
      <Image
        src="/images/logo1.png"
        alt="HerWellness logo"
        width={50}
        height={50}
        className="object-contain"
      />
      <span className="text-lg font-semibold tracking-tight text-gray-900">
        Her<span className="text-pink-900">Wellness</span>
      </span>
    </Link>
  );
}

const inputClass =
  "w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED] transition-colors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center px-4 py-10">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="w-full max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center mb-6">
          <Logo />
          <p className="text-sm text-[#8A8299] mt-2">Good to see you again</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-6 md:p-8"
        >
          <h1
            className="text-2xl text-[#251C35] mb-6"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Welcome Back
          </h1>

          {error && (
            <p className="text-red-500 bg-red-50 rounded-xl px-4 py-2.5 mb-4 text-sm">{error}</p>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-sm text-[#251C35] font-medium mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#251C35] font-medium mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Your password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#7C3AED] text-white p-3 rounded-xl font-medium mt-6 hover:bg-[#6B21D8] transition-colors disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-[#8A8299] text-center mt-5">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#7C3AED] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}