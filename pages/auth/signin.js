// pages/auth/signin.js
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaGoogle, FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { callbackUrl, error } = router.query;

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await signIn("email", {
        email,
        callbackUrl: callbackUrl || "/",
        redirect: false,
      });
      
      if (result?.error) {
        console.error("Sign in error:", result.error);
        setIsSubmitting(false);
      } else if (result?.url) {
        // Email sent successfully, redirect to verification page
        router.push("/auth/verify-request");
      }
    } catch (err) {
      console.error("Sign in exception:", err);
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = () => {
    switch (error) {
      case "OAuthSignin":
        return "Error during OAuth sign in";
      case "EmailSignin":
        return "Error sending the email";
      case "Verification":
        return "The verification link is invalid or has expired";
      default:
        return error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1E40AF] mb-2">LYKMYND</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{getErrorMessage()}</span>
            </div>
          )}

          {/* Email Sign-in Form */}
          <form className="space-y-6" onSubmit={handleEmailSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <FaEnvelope className="mr-2" />
                {isSubmitting ? "Sending link..." : "Sign in with Email"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => signIn("google", { callbackUrl: callbackUrl || "/" })}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaGoogle className="mr-2 text-red-500" />
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="flex justify-center items-center text-sm text-blue-600 hover:text-blue-800">
              <FaArrowLeft className="mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}