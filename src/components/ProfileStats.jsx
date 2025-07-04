// Add countries display to the ProfileStats component
const ProfileStats = ({ userData }) => {
  return (
    <div className="profile-stats">
      <div className="stat-card">
        <div className="stat-icon">🌍</div>
        <div className="stat-value">{userData.countriesCount || 0}</div>
        <div className="stat-label">Countries</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🏆</div>
        <div className="stat-value">{userData.tripsHosted || 0}</div>
        <div className="stat-label">Hosted</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">✈️</div>
        <div className="stat-value">{userData.tripsJoined || 0}</div>
        <div className="stat-label">Joined</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🧳</div>
        <div className="stat-value">{userData.totalTrips || 0}</div>
        <div className="stat-label">Total Trips</div>
      </div>
    </div>
  );
};