import { Wallet } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex  items-center justify-center bg-[#0d1117] flex-col gap-4" style={{ height: "100%" }}>
      <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
        <Wallet size={18} className="text-white" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-white font-semibold text-sm">கல்லாப்பெட்டி</span>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
