import React from 'react';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="input-group eventhub-search">
      <span className="input-group-text">Search</span>
      <input
        type="search"
        className="form-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchBar;
