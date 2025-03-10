// components/AuthButton.js
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

/**
 * A reusable authentication button component
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes for the button
 * @param {string} props.text - Button text for sign in (defaults to "Sign In")
 * @param {function} props.onClick - Optional callback for when button is clicked
 * @param {ReactNode} props.icon - Optional icon element to display before text
 * @param {ReactNode} props.children - Optional children to render inside the button
 * @param {boolean} props.hideWhenSignedIn - Whether to hide the button when user is signed in (default: false)
 */
export default function AuthButton({ 
  className = "",
  text = "Sign In", 
  onClick, 
  icon, 
  children,
  hideWhenSignedIn = false
}) {
  const { data: session } = useSession();
  
  // Don't render if user is signed in and hideWhenSignedIn is true
  if (session && hideWhenSignedIn) {
    return null;
  }
  
  // If already signed in, don't render the sign in button
  if (session) {
    return null;
  }
  
  // Default button style if no className provided
  const defaultClassName = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition";
  const buttonClassName = className || defaultClassName;
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <Link href="/auth/signin">
      <button className={buttonClassName} onClick={handleClick}>
        {icon && <span className="mr-2">{icon}</span>}
        {children || text}
      </button>
    </Link>
  );
}

export function GoogleAuthButton() {
  return (
    <button 
      onClick={() => signIn("google")} 
      className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow transition"
    >
      Sign in with Google
    </button>
  );
}