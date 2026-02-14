import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

export default function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<StarIcon key={i} className={`${sizeClass} text-amber-400`} />);
    } else {
      stars.push(<StarOutline key={i} className={`${sizeClass} text-gray-600`} />);
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
