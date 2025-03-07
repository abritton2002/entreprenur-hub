// pages/auth/verify-request.js
import Link from "next/link";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {/* Logo and Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#1E40AF] mb-2">LYKMYND</h2>
            <p className="text-gray-600">Check your email</p>
          </div>

          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
            <FaEnvelope className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Check your inbox</h2>
          
          <p className="text-gray-600 mb-6">
            A sign in link has been sent to your email address.
            Please check your inbox and click the link to complete the sign in process.
          </p>
          
          <div className="text-sm text-gray-500 mb-8">
            <p>The link will expire in 24 hours.</p>
            <p>If you don't see the email, check your spam folder.</p>
          </div>

          <Link href="/auth/signin" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-1" />
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}