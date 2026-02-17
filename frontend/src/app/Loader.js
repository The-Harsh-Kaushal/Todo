
import Logo from "@/components/Logo";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      
      <div className="relative flex items-center justify-center">
        
        {/* Rotating ring */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>

        {/* Glow effect */}
        <div className="absolute w-28 h-28 bg-white/10 blur-2xl rounded-full animate-pulse"></div>

        {/* Logo */}
        <div className="w-16 h-16 animate-fadeIn">
          <Logo />
        </div>

      </div>
    </div>
  );
}
