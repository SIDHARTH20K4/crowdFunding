import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useCreateCampaign } from '../Connections/connections';
import { parseEther } from 'viem';

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

const CreateCampaign: React.FC<CreateCampaignProps> = ({ onSuccess, onClose }) => {
  const { address, isConnected } = useAccount();
  const { CreateCampaign, isPending, isConfirming, error } = useCreateCampaign({
    onSuccess: () => {
      onSuccess?.();
      onClose?.();
    }
  });

  const [formData, setFormData] = useState<FormData>({
    targetAmount: '',
    description: '',
    image: '',
    durationInDays: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

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
      CreateCampaign(
        parseEther(formData.targetAmount),
        formData.description,
        formData.image || "https://placehold.co/600x400/4F46E5/white?text=Crowdfunding+Campaign",
        BigInt(parseInt(formData.durationInDays))
      );
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
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>
        <p className="text-gray-600 mb-4">Please connect your wallet to create a campaign.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    style={{
      flex: '1 0 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}  
    >
      <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4"
      style={{
        flex: '1 0 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: '25px',
      }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.targetAmount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 5.0"
          />
          {errors.targetAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="What are you raising funds for?"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (Days)
          </label>
          <input
            type="number"
            name="durationInDays"
            value={formData.durationInDays}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.durationInDays ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 30"
            min="1"
          />
          {errors.durationInDays && (
            <p className="mt-1 text-sm text-red-600">{errors.durationInDays}</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Error: {error.message}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              disabled={isPending || isConfirming}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isPending || isConfirming ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;