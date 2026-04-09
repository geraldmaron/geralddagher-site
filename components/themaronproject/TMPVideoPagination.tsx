'use client';
import Pagination from '@/components/core/Pagination';

interface TMPVideoPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TMPVideoPagination: React.FC<TMPVideoPaginationProps> = ({ currentPage, totalPages, onPageChange }) => (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={onPageChange}
    className="justify-center mt-8"
  />
);

export default TMPVideoPagination;
