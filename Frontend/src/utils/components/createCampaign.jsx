// components/CreateCampaign.jsx
import { useCreateCampaign } from '../Connections/connections';
import { useState } from 'react';
import { useBlock } from 'wagmi';

export function CreateCampaign() {
  const [formData, setFormData] = useState({
    targetAmount: '',
    description: '',
    img: '',
    durationInDays: ''
  });
  const [errors, setErrors] = useState({});
  const { data: blockData } = useBlock();
  const currentTimestamp = blockData?.timestamp || BigInt(Math.floor(Date.now() / 1000));

  const { createCampaign, isPending } = useCreateCampaign();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.durationInDays || Number(formData.durationInDays) <= 0) {
      newErrors.durationInDays = 'Duration must be at least 1 day';
    }

    if (formData.img && !isValidUrl(formData.img)) {
      newErrors.img = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const calculateDeadline = () => {
    const daysInSeconds = BigInt(Number(formData.durationInDays) * 24 * 60 * 60);
    return currentTimestamp + daysInSeconds;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const deadlineTimestamp = calculateDeadline();
    
    createCampaign(
      BigInt(Number(formData.targetAmount) * 10**18), // Convert ETH to wei
      formData.description.trim(),
      formData.img.trim(),
      BigInt(formData.durationInDays)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getEstimatedEndDate = () => {
    if (!formData.durationInDays) return null;
    
    const days = Number(formData.durationInDays);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return endDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="create-campaign">
      <div className="create-header">
        <h2>Launch Your Campaign</h2>
        <p>Bring your idea to life with community support</p>
      </div>

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-grid">
          {/* Target Amount */}
          <div className="form-group">
            <label className="form-label">
              <span>💰 Target Amount (ETH)</span>
              <div className="input-container">
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="10.0"
                  step="0.1"
                  min="0.1"
                  className={errors.targetAmount ? 'error' : ''}
                />
                <span className="input-suffix">ETH</span>
              </div>
              {errors.targetAmount && (
                <span className="error-text">{errors.targetAmount}</span>
              )}
            </label>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label">
              <span>⏰ Campaign Duration (Days)</span>
              <div className="input-container">
                <input
                  type="number"
                  name="durationInDays"
                  value={formData.durationInDays}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  max="365"
                  className={errors.durationInDays ? 'error' : ''}
                />
                <span className="input-suffix">Days</span>
              </div>
              {errors.durationInDays && (
                <span className="error-text">{errors.durationInDays}</span>
              )}
              {formData.durationInDays && (
                <div className="info-text">
                  Estimated end: {getEstimatedEndDate()}
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            <span>📝 Campaign Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project, goals, and how funds will be used..."
              rows={4}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
            <div className="info-text">
              Be specific about your project and funding goals
            </div>
          </label>
        </div>

        {/* Image URL */}
        <div className="form-group">
          <label className="form-label">
            <span>🖼️ Campaign Image URL (Optional)</span>
            <input
              type="url"
              name="img"
              value={formData.img}
              onChange={handleChange}
              placeholder="https://example.com/your-image.jpg"
              className={errors.img ? 'error' : ''}
            />
            {errors.img && (
              <span className="error-text">{errors.img}</span>
            )}
            {formData.img && (
              <div className="image-preview">
                <img 
                  src={formData.img} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </label>
        </div>

        {/* Campaign Summary */}
        <div className="campaign-summary">
          <h4>Campaign Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span>Target Amount:</span>
              <strong>{formData.targetAmount || '0'} ETH</strong>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <strong>{formData.durationInDays || '0'} days</strong>
            </div>
            <div className="summary-item">
              <span>Estimated End:</span>
              <strong>{getEstimatedEndDate() || 'Select duration'}</strong>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending} 
          className={`submit-btn ${isPending ? 'loading' : ''}`}
        >
          {isPending ? (
            <>
              <div className="spinner"></div>
              Creating Campaign...
            </>
          ) : (
            '🚀 Launch Campaign'
          )}
        </button>
      </form>
    </div>
  );
}