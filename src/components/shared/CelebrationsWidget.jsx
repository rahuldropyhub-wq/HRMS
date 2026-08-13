import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Award, Star, Plus, Send, X, Calendar, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUpcomingCelebrations, getAppreciations, createAppreciation } from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/shared/celebrations.css';

const CelebrationsWidget = ({ isAdmin = false }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('celebrations'); // 'celebrations' or 'appreciations'
  const [celebrations, setCelebrations] = useState([]);
  const [appreciations, setAppreciations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [wishInputs, setWishInputs] = useState({});
  const [formData, setFormData] = useState({
    receiver_name: '',
    receiver_id: null,
    type: 'shoutout',
    message: ''
  });

  const loadData = async () => {
    setLoading(true);
    const [celRes, appRes] = await Promise.all([
      getUpcomingCelebrations(),
      getAppreciations()
    ]);
    if (celRes.data) {
      const today = new Date();
      const todaysCels = celRes.data.filter(c => 
        c.date.getDate() === today.getDate() && c.date.getMonth() === today.getMonth()
      );
      setCelebrations(todaysCels);

      if (todaysCels.length > 0 && !sessionStorage.getItem('celebrationPlayed')) {
        // Play Confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Play Tada Sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        audio.play().catch(e => console.log('Audio autoplay prevented:', e));
        
        sessionStorage.setItem('celebrationPlayed', 'true');
      }
    }
    if (appRes.data) setAppreciations(appRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitAppreciation = async (e) => {
    e.preventDefault();
    if (!formData.receiver_name || !formData.message) return;
    
    // In a real app we'd have a dropdown to select receiver_id.
    // For simplicity we just save the name string.
    const newAppreciation = {
      sender_id: profile.id,
      sender_name: `${profile.first_name} ${profile.last_name}`,
      receiver_name: formData.receiver_name,
      message: formData.message,
      type: formData.type
    };

    await createAppreciation(newAppreciation);
    setShowModal(false);
    setFormData({ receiver_name: '', receiver_id: null, type: 'shoutout', message: '' });
    loadData();
  };

  const handleQuickWish = async (e, celebration) => {
    e.preventDefault();
    const message = wishInputs[celebration.id];
    if (!message) return;

    const newAppreciation = {
      sender_id: profile.id,
      sender_name: `${profile.first_name} ${profile.last_name}`,
      receiver_name: celebration.employee.name,
      receiver_id: celebration.employee.id,
      message: message,
      type: celebration.type // 'birthday' or 'anniversary'
    };

    await createAppreciation(newAppreciation);
    setWishInputs(prev => ({...prev, [celebration.id]: ''}));
    alert(`Wish sent to ${celebration.employee.name}!`);
    loadData();
  };

  if (!loading && celebrations.length === 0 && appreciations.length === 0) {
    return null;
  }

  return (
    <div className="celebrations-widget">
      <div className="widget-header">
        <div className="widget-tabs">
          <button 
            className={`tab-btn ${activeTab === 'celebrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('celebrations')}
          >
            <PartyPopper size={16} />
            Celebrations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appreciations' ? 'active' : ''}`}
            onClick={() => setActiveTab('appreciations')}
          >
            <Star size={16} />
            Appreciations
          </button>
        </div>
        
        {/* Only admins or allowed users can post, but let's allow all for now as requested */}
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Shoutout</span>
        </button>
      </div>

      <div className="widget-content">
        {loading ? (
          <div className="widget-loading">Loading...</div>
        ) : activeTab === 'celebrations' ? (
          <div className="celebrations-list">
            {celebrations.length === 0 ? (
              <div className="empty-state">No celebrations today.</div>
            ) : (
              celebrations.map((c) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={c.id} 
                  className="celebration-item-wrapper"
                >
                  <div className="celebration-item">
                    {c.employee.avatar ? (
                      <img src={c.employee.avatar} alt={c.employee.name} className="celebration-avatar" />
                    ) : (
                      <div className="icon-box" style={{ background: c.type === 'birthday' ? '#fdf2f8' : '#eff6ff', color: c.type === 'birthday' ? '#db2777' : '#2563eb' }}>
                        {c.type === 'birthday' ? <Gift size={20} /> : <Award size={20} />}
                      </div>
                    )}
                    <div className="details">
                      <h4>{c.employee.name}</h4>
                      <p>
                        {c.type === 'birthday' 
                          ? `Birthday on ${c.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` 
                          : `${c.years} Year Work Anniversary on ${c.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                    </div>
                  </div>
                  
                  <form className="quick-wish-form" onSubmit={(e) => handleQuickWish(e, c)}>
                    <input 
                      type="text" 
                      placeholder={`Wish ${c.employee.name.split(' ')[0]}...`}
                      value={wishInputs[c.id] || ''}
                      onChange={(e) => setWishInputs({...wishInputs, [c.id]: e.target.value})}
                      required
                    />
                    <button type="submit" className="quick-wish-btn"><Send size={14} /></button>
                  </form>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="appreciations-list">
            {appreciations.length === 0 ? (
              <div className="empty-state">No appreciations yet. Be the first!</div>
            ) : (
              appreciations.map((a) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={a.id} 
                  className="appreciation-item"
                >
                  <div className="appreciation-header">
                    <span className="type-badge">{a.type}</span>
                    <span className="date">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="message">"{a.message}"</p>
                  <div className="people">
                    <span className="receiver">To: {a.receiver_name}</span>
                    <span className="sender">From: {a.sender_name}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Shoutout Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content shoutout-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>Give a Shoutout</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmitAppreciation}>
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="shoutout">Shoutout</option>
                    <option value="award">Award / Recognition</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>To (Employee Name)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Jane Doe"
                    value={formData.receiver_name}
                    onChange={e => setFormData({...formData, receiver_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    required 
                    placeholder="Write your appreciation message..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">
                    <Send size={16} /> Send
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CelebrationsWidget;
