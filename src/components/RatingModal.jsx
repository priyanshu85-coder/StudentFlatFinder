import React, { useState, useEffect } from 'react';
import { X, Star, MessageCircle } from 'lucide-react';
import StarRating from './StarRating';

const RatingModal = ({ 
  isOpen, 
  onClose, 
  property, 
  existingRating = null, 
  onSubmit 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    location: 0,
    cleanliness: 0,
    amenities: 0,
    valueForMoney: 0,
    landlordResponse: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setReview(existingRating.review || '');
      setCategories(existingRating.categories || {
        location: 0,
        cleanliness: 0,
        amenities: 0,
        valueForMoney: 0,
        landlordResponse: 0
      });
    } else {
      // Reset form
      setRating(0);
      setReview('');
      setCategories({
        location: 0,
        cleanliness: 0,
        amenities: 0,
        valueForMoney: 0,
        landlordResponse: 0
      });
    }
  }, [existingRating, isOpen]);

  const handleCategoryRating = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    console.log('Submitting rating data:', {
      propertyId: property._id,
      rating,
      review: review.trim(),
      categories
    });
    setLoading(true);
    try {
      await onSubmit({
        propertyId: property._id,
        rating,
        review: review.trim(),
        categories
      });
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Error submitting rating. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryLabels = {
    location: 'Location',
    cleanliness: 'Cleanliness',
    amenities: 'Amenities',
    valueForMoney: 'Value for Money',
    landlordResponse: 'Landlord Response'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {existingRating ? 'Update Rating' : 'Rate Property'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Property Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">{property?.title}</h4>
            <p className="text-sm text-gray-600">{property?.address}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="lg"
                className="justify-center"
              />
            </div>

            {/* Category Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Detailed Ratings (Optional)
              </label>
              <div className="space-y-3">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <StarRating
                      rating={categories[key]}
                      interactive={true}
                      onRatingChange={(value) => handleCategoryRating(key, value)}
                      size="sm"
                      showNumber={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Share your experience with this property..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {review.length}/500 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;