import logo from "../assets/money-leak-logo.png";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10 sm:h-11 sm:w-11",
  lg: "h-16 w-16",
  xl: "h-24 w-24 sm:h-36 sm:w-36",
};

export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: Props) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      <img
        src={logo}
        alt="கல்லாப்பெட்டி"
        className={`${sizes[size]} flex-shrink-0 object-contain drop-shadow-sm`}
      />
      {showText && (
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight tracking-tight text-white sm:text-base">
            கல்லாப்பெட்டி
          </div>
          <div className="truncate text-[10px] leading-tight text-slate-400">
            Track every rupee
          </div>
        </div>
      )}
    </div>
  );
}
