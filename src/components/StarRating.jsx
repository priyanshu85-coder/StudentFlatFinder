import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange = null,
  showNumber = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-1">
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isHalfFilled = rating > index && rating < starRating;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starRating)}
              disabled={!interactive}
              className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled 
                    ? 'text-yellow-400 fill-current' 
                    : isHalfFilled
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300'
                } ${interactive ? 'hover:text-yellow-400' : ''}`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;