import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, CROWDFUNDING_ABI } from '../../config/contracts';

interface CreateCampaignProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  targetAmount: string;
  description: string;
  image: string;
  durationInDays: string;
}

interface FormErrors {
  targetAmount?: string;
  description?: string;
  durationInDays?: string;
}

export const CreateCampaign: React.FC<CreateCampaignProps> = ({ onSuccess, onClose }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [formData, setFormData] = useState<FormData>({
    targetAmount: '',
    description: '',
    image: '',
    durationInDays: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Auto-close on success
  React.useEffect(() => {
    if (isSuccess) {
      alert('Campaign created successfully!');
      onSuccess?.();
      onClose?.();
    }
  }, [isSuccess]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.durationInDays || parseInt(formData.durationInDays) <= 0) {
      newErrors.durationInDays = 'Please enter a valid duration';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!isConnected) return;

    try {
      writeContract({
        address: CONTRACTS.CROWDFUNDING_ADDRESS,
        abi: CROWDFUNDING_ABI,
        functionName: 'createCampaign',
        args: [
          parseEther(formData.targetAmount),
          formData.description,
          formData.image || "https://via.placeholder.com/300?text=Campaign",
          BigInt(parseInt(formData.durationInDays))
        ],
        maxFeePerGas: 30_000_000_000n, // 30 Gwei for Polygon Amoy
        maxPriorityFeePerGas: 30_000_000_000n,
      });
    } catch (err) {
      console.error('Error creating campaign:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isConnected) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        textAlign: 'center'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Create Campaign</h2>
        <p style={{ color: '#666', marginBottom: 0 }}>
          Please connect your wallet to create a campaign.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        marginTop: 0, 
        marginBottom: '24px',
        color: '#333',
        fontSize: '1.5rem'
      }}>
        Create New Campaign
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Target Amount (MATIC)
          </label>
          <input
            type="number"
            step="0.001"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="e.g., 1.0"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.targetAmount ? '#f44336' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {errors.targetAmount && (
            <p style={{ 
              margin: '6px 0 0 0', 
              fontSize: '0.85rem', 
              color: '#f44336' 
            }}>
              {errors.targetAmount}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="What are you raising funds for?"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.description ? '#f44336' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          {errors.description && (
            <p style={{ 
              margin: '6px 0 0 0', 
              fontSize: '0.85rem', 
              color: '#f44336' 
            }}>
              {errors.description}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333'
          }}>
            Duration (Days)
          </label>
          <input
            type="number"
            name="durationInDays"
            value={formData.durationInDays}
            onChange={handleChange}
            placeholder="e.g., 30"
            min="1"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${errors.durationInDays ? '#f44336' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {errors.durationInDays && (
            <p style={{ 
              margin: '6px 0 0 0', 
              fontSize: '0.85rem', 
              color: '#f44336' 
            }}>
              {errors.durationInDays}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '1px solid #f44336'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem', 
              color: '#c62828' 
            }}>
              Error: {error.message}
            </p>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingTop: '8px'
        }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isConfirming}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
                opacity: isPending || isConfirming ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || isConfirming}
            style={{
              padding: '12px 24px',
              backgroundColor: isPending || isConfirming ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isPending ? 'Awaiting Approval...' : isConfirming ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;