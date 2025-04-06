import { useState } from 'react';

export function CreateCampaign({ createCampaign, loading }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    img: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createCampaign(formData.amount, formData.description, formData.img);
    setFormData({ amount: '', description: '', img: '' });
  };

  return (
    <div className="create-campaign card p-4 mb-4">
      <h3>Create New Campaign</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Target Amount (ETH)</label>
          <input
            type="number"
            className="form-control"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Image URL</label>
          <input
            type="text"
            className="form-control"
            value={formData.img}
            onChange={(e) => setFormData({...formData, img: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}