import logo from "../assets/money-leak-logo.png";

export default function LoadingScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 bg-[#0d1117]"
      style={{ height: "100%" }}
    >
      <img
        src={logo}
        alt="கல்லாப்பெட்டி"
        className="h-16 w-16 object-contain animate-pulse"
      />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-white">கல்லாப்பெட்டி</span>
        <div className="mt-2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
