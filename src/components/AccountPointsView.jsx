import React from 'react';
import PropTypes from 'prop-types';

export default function AccountPointsView({ accountPoints }) {
  return (
    <>
      <h2>Account Points: {accountPoints.points}</h2>
      <div className="referees">
        <h5>List of Referees - No: { accountPoints.senders.length}</h5>
        <div className="content">
          <ul>
            { accountPoints.senders.length > 0 && accountPoints.senders.map((accountId, i) =>
              <li key={i} >{ accountId }</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

// AccountPointsView.propTypes = {
//   accountPoints: PropTypes.u16.isRequired
// };
