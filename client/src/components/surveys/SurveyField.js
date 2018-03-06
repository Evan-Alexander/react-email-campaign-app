// SurveyField contains logic to render a single label and text input
import React from 'react';

// once the field has been clicked into or (touched), validate the field
export default ({ input, label, meta: { error, touched } }) => {
  return (
    <div>
      <label>{ label }</label>
    <input {...input} style={{ marginBottom: '5px' }}/>
    <div className="red-text" style={{ marginBottom: '20px' }}>
      {touched && error}
    </div>
    </div>
  );
}
