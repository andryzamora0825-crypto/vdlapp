import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-4 relative overflow-hidden">
      {/* Background gradients similar to landing for consistency */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <SignUp 
          appearance={{
            elements: {
              card: "bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md rounded-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "text-white border border-white/20 hover:bg-white/5",
              socialButtonsBlockButtonText: "text-gray-200",
              dividerLine: "bg-white/20",
              dividerText: "text-gray-400",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-[#0A0A0B] border border-white/20 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500",
              formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]",
              footerActionText: "text-gray-400",
              footerActionLink: "text-emerald-400 hover:text-emerald-300"
            }
          }}
        />
      </div>
    </div>
  );
}
