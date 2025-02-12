import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="header">
      <div className="container">
        <h1 className="title">🥒 Pickleball Pro Matches</h1>
        <div className="live-badge">LIVE NOW</div>
      </div>
    </div>
  );
};

export default Header;
