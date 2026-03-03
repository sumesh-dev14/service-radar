import { useTheme } from '../../providers/ThemeProvider';
import { X } from 'lucide-react';
import { useState } from 'react';

interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

export default function SplitLayout({
  left,
  right,
  title,
  onClose,
}: SplitLayoutProps) {
  const { theme } = useTheme();
  const [isMobileRightOpen, setIsMobileRightOpen] = useState(false);

  const handleClose = () => {
    setIsMobileRightOpen(false);
    onClose?.(); // ✅ safely call if provided
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      
      {/* Left side */}
      <div className="overflow-y-auto">
        {left}
      </div>

      {/* Right side - Desktop */}
      <div className="hidden lg:block overflow-y-auto">
        {right}
      </div>

      {/* Right side - Mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileRightOpen(true)}
          className="w-full py-2 px-4 bg-linear-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {title || 'View Details'}
        </button>

        {/* Mobile Modal */}
        {isMobileRightOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            
            {/* Slide panel */}
            <div
              className={`fixed inset-y-0 right-0 w-full max-w-sm ${
                theme === 'dark'
                  ? 'bg-card'
                  : 'bg-card shadow-lg'
              } overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <h2 className="font-semibold text-foreground">
                  {title || 'Details'}
                </h2>

                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-foreground/5 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {right}
              </div>
            </div>

            {/* Click outside to close */}
            <div
              className="absolute inset-0 -z-10"
              onClick={handleClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}