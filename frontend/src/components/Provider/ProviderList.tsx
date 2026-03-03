import { useTheme } from '../../providers/ThemeProvider';
import ProviderCard from './ProviderCard';
import { Grid } from 'lucide-react';

interface Provider {
  _id: string;
  userId?: any;
  categoryId?: any;
  bio: string;
  price: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  location: any;
}

interface ProviderListProps {
  providers: Provider[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export default function ProviderList({ providers, isLoading = false, isEmpty = false }: ProviderListProps) {
  const { theme } = useTheme();

  if (isEmpty) {
    return (
      <div className={`rounded-xl p-8 border-2 border-dashed border-border/30 text-center ${
        theme === 'dark' ? 'bg-background/30' : 'bg-background/50'
      }`}>
        <Grid className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No providers found</h3>
        <p className="text-foreground/60">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`rounded-xl h-64 animate-pulse ${
              theme === 'dark' ? 'bg-background/50' : 'bg-background/30'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <ProviderCard
          key={provider._id}
          id={provider._id}
          name={typeof provider.userId === 'string' ? 'Provider' : provider.userId?.name || 'Provider'}
          category={typeof provider.categoryId === 'string' ? 'Service' : provider.categoryId?.name || 'Service'}
          rating={provider.rating}
          reviews={provider.totalReviews}
          price={provider.price}
          location={`${provider.location?.lat?.toFixed(2)}, ${provider.location?.lng?.toFixed(2)}`}
          isAvailable={provider.isAvailable}
          bio={provider.bio}
        />
      ))}
    </div>
  );
}