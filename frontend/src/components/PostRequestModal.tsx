import React, { useState, useCallback, memo } from 'react';

interface FormData {
  eventName: string;
  location: string;
  date: string;
  time: string;
  price: string;
  description: string;
  bookType: 'individual' | 'group';
  memberCount?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface PostRequestModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialFormData?: FormData;
}

const PostRequestModal: React.FC<PostRequestModalProps> = memo(({ onClose, onSubmit, initialFormData }) => {
  // Local state for form data - this prevents re-renders from parent affecting focus
  const [formData, setFormData] = useState<FormData>(
    initialFormData || {
      eventName: '',
      location: '',
      date: '',
      time: '',
      price: '',
      description: '',
      bookType: 'individual'
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Memoized input handler to prevent unnecessary re-renders
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.price || isNaN(Number(formData.price))) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.bookType) {
      newErrors.bookType = 'Book type is required';
    }
    if (formData.bookType === 'group' && (!formData.memberCount || isNaN(Number(formData.memberCount)) || Number(formData.memberCount) < 1)) {
      newErrors.memberCount = 'Valid member count is required for group booking';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(formData);
      // Reset form and close modal on successful submission
      setFormData({
        eventName: '',
        location: '',
        date: '',
        time: '',
        price: '',
        description: '',
        bookType: 'individual'
      });
      setErrors({});
      setSubmitError('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setFormData({
      eventName: '',
      location: '',
      date: '',
      time: '',
      price: '',
      description: '',
      bookType: 'individual'
    });
    setErrors({});
    setSubmitError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s ease-out',
        minHeight: '100vh',
        width: '100vw'
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="w-[90vw] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] xl:w-[55vw] 2xl:w-[45vw] transform transition-all duration-300 ease-out my-4 sm:my-6"
        style={{
          maxWidth: '900px',
          minWidth: '320px',
          animation: 'scaleIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Container */}
        <div
          className="modal-container rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1F2937 0%, #111827 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-2xl font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #9CA3AF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Post Bouncer Request
                </h2>
                <p className="text-sm text-gray-400 mt-1">Fill in your event requirements</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/30 transition-all duration-200 flex items-center justify-center"
                style={{ fontSize: '20px', lineHeight: '1' }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-form p-4 sm:p-6 md:p-8 lg:p-10 max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                  className={`modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                    errors.eventName
                      ? 'border-red-500/50 bg-red-500/5 text-red-400 placeholder-red-400/50 focus:border-red-500 focus:bg-red-500/10'
                      : 'border-gray-600/30 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10'
                  }`}
                  style={{
                    borderWidth: '1px',
                    outline: 'none'
                  }}
                  placeholder="Wedding, Birthday Party, Corporate Event..."
                  autoComplete="off"
                />
                {errors.eventName && (
                  <p className="text-red-400 text-xs mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.eventName}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                    errors.location
                      ? 'border-red-500/50 bg-red-500/5 text-red-400 placeholder-red-400/50 focus:border-red-500 focus:bg-red-500/10'
                      : 'border-gray-600/30 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10'
                  }`}
                  style={{
                    borderWidth: '1px',
                    outline: 'none'
                  }}
                  placeholder="Venue address or location"
                  autoComplete="off"
                />
                {errors.location && (
                  <p className="text-red-400 text-xs mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.location}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                      errors.date
                        ? 'border-red-500/50 bg-red-500/5 text-red-400 focus:border-red-500 focus:bg-red-500/10'
                        : 'border-gray-600/30 bg-gray-800/50 text-gray-100 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10'
                    }`}
                    style={{
                      borderWidth: '1px',
                      outline: 'none'
                    }}
                  />
                  {errors.date && (
                    <p className="text-red-400 text-xs mt-2 flex items-center">
                      <span className="mr-1">⚠</span> {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                      errors.time
                        ? 'border-red-500/50 bg-red-500/5 text-red-400 focus:border-red-500 focus:bg-red-500/10'
                        : 'border-gray-600/30 bg-gray-800/50 text-gray-100 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10'
                    }`}
                    style={{
                      borderWidth: '1px',
                      outline: 'none'
                    }}
                  />
                  {errors.time && (
                    <p className="text-red-400 text-xs mt-2 flex items-center">
                      <span className="mr-1">⚠</span> {errors.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget (₹) <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                    errors.price
                      ? 'border-red-500/50 bg-red-500/5 text-red-400 placeholder-red-400/50 focus:border-red-500 focus:bg-red-500/10'
                      : 'border-gray-600/30 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10'
                  }`}
                  style={{
                    borderWidth: '1px',
                    outline: 'none'
                  }}
                  placeholder="Enter your budget"
                  autoComplete="off"
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.price}
                  </p>
                )}
              </div>

              {/* Book Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Book Type <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="bookType"
                      value="individual"
                      checked={formData.bookType === 'individual'}
                      onChange={(e) => handleInputChange('bookType', e.target.value)}
                      className="w-4 h-4 text-blue-500 border-gray-600 bg-gray-800 focus:ring-blue-500 focus:ring-2"
                      style={{
                        accentColor: '#2563EB'
                      }}
                    />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                      Individual Booking
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="bookType"
                      value="group"
                      checked={formData.bookType === 'group'}
                      onChange={(e) => handleInputChange('bookType', e.target.value)}
                      className="w-4 h-4 text-blue-500 border-gray-600 bg-gray-800 focus:ring-blue-500 focus:ring-2"
                      style={{
                        accentColor: '#2563EB'
                      }}
                    />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                      Group Booking
                    </span>
                  </label>
                </div>
                {errors.bookType && (
                  <p className="text-red-400 text-xs mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.bookType}
                  </p>
                )}
              </div>

              {/* Member Count - Only show for Group Booking */}
              {formData.bookType === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    How many members are needed? <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.memberCount || ''}
                    onChange={(e) => handleInputChange('memberCount', e.target.value)}
                    className={`modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                      errors.memberCount
                        ? 'border-red-500/50 bg-red-500/5 text-red-400 placeholder-red-400/50 focus:border-red-500 focus:bg-red-500/10'
                        : 'border-gray-600/30 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10'
                    }`}
                    style={{
                      borderWidth: '1px',
                      outline: 'none'
                    }}
                    placeholder="Enter number of members needed"
                    autoComplete="off"
                  />
                  {errors.memberCount && (
                    <p className="text-red-400 text-xs mt-2 flex items-center">
                      <span className="mr-1">⚠</span> {errors.memberCount}
                    </p>
                  )}
                </div>
              )}

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Details
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="modal-input w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 rounded-lg transition-all duration-200 border-gray-600/30 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-blue-500/10 resize-none text-sm sm:text-base"
                  style={{
                    borderWidth: '1px',
                    outline: 'none'
                  }}
                  placeholder="Any specific requirements or details..."
                  autoComplete="off"
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div
                  className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    borderLeftWidth: '3px',
                    borderLeftColor: '#ef4444'
                  }}
                >
                  <p className="text-red-400 text-sm flex items-center">
                    <span className="mr-2">⚠</span>
                    {submitError}
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-lg font-semibold transition-all duration-200 border border-gray-600/50 text-gray-300 hover:bg-gray-700/30 hover:text-white hover:border-gray-600 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm sm:text-base"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(37, 99, 235, 0.3)';
                  }}
                >
                  <span className="relative z-10">
                    {isSubmitting ? 'Posting...' : 'Post Request'}
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Animations and Responsive Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Ensure modal doesn't exceed viewport height */
        @media (max-height: 600px) {
          .modal-container {
            max-height: 95vh;
            overflow-y: auto;
          }
        }

        /* Handle extreme zoom levels */
        @media (max-width: 380px) {
          .modal-form {
            padding: 1rem !important;
          }
          .modal-input {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.875rem !important;
          }
        }

        /* Ensure proper scaling at high zoom levels */
        @media (min-resolution: 1.5dppx) {
          .modal-input {
            border-width: 0.5px;
          }
        }
      `}</style>
    </div>
  );
});

PostRequestModal.displayName = 'PostRequestModal';

export default PostRequestModal;