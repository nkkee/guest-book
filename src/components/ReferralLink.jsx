import React from 'react';
import PropTypes from 'prop-types';

export default function ReferralLink({ link }) {
  return (
    <>
      <h2>Referral Link</h2>
      <p>{link}</p>
    </>
  );
}

ReferralLink.propTypes = {
  link: PropTypes.string.isRequired
};
