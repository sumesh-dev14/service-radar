import { useTheme } from '../../providers/ThemeProvider';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({ size = 'md', fullScreen = false, message }: LoadingSpinnerProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} border-3 border-primary/20 border-t-primary rounded-full animate-spin`} />
      {message && <p className="text-foreground/60 text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${
        theme === 'dark' ? 'bg-background/80' : 'bg-background/80'
      } backdrop-blur-sm`}>
        {spinner}
      </div>
    );
  }

  return spinner;
}