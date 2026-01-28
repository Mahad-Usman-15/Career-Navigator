import React from 'react';

export const loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#171717] z-50">
      <div className="spinner">
        <div className="spinner1"></div>
      </div>
    </div>
  )
}

export default loading