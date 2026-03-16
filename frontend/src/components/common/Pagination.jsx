import React from 'react';
import usePagination from '../../hooks/usePagination';

function Pagination({ currentPage = 0, totalItems = 0, pageSize = 5, onPageChange }) {
  const { totalPages, pages } = usePagination(currentPage, totalItems, pageSize);

  return (
    <nav aria-label="Pagination">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage <= 0 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(currentPage - 1)}>Previous</button>
        </li>
        {pages.map((page) => (
          <li className={`page-item ${page === currentPage + 1 ? 'active' : ''}`} key={page}>
            <button type="button" className="page-link" onClick={() => onPageChange(page - 1)}>{page}</button>
          </li>
        ))}
        <li className={`page-item ${currentPage + 1 >= totalPages ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(currentPage + 1)}>Next</button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
