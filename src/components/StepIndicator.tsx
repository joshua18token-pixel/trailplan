import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isComplete = i < currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isComplete ? "bg-forest text-white" : isActive ? "bg-sunset text-white ring-4 ring-sunset/20" : "bg-cream-dark text-night/40"}`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors ${isActive ? "text-sunset" : isComplete ? "text-forest" : "text-night/40"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 mb-6 transition-colors ${i < currentStep ? "bg-forest" : "bg-cream-dark"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
