import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { categorySchema } from '../../utils/validators';
import { createCategoryAsync, deleteCategoryAsync, fetchCategoriesAsync } from './categoriesSlice';
import { useToast } from '../../hooks/useToast';

const PAGE_SIZE = 5;

function CategoryManagerPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, loading } = useSelector((state) => state.categories);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [page, setPage] = useState(0);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const startIndex = currentPage * PAGE_SIZE;
  const paginatedItems = items.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const onSubmit = async (values) => {
    const result = await dispatch(createCategoryAsync(values));
    if (createCategoryAsync.fulfilled.match(result)) {
      toast.success('Category created successfully');
      reset();
      setPage(0);
    } else {
      toast.error(result.payload || 'Unable to create category');
    }
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteCategoryAsync(pendingDelete.id));
    if (deleteCategoryAsync.fulfilled.match(result)) {
      toast.success('Category deleted successfully');
    } else {
      toast.error(result.payload || 'Unable to delete category');
    }
    setPendingDelete(null);
  };

  return (
    <div className="page-enter eventhub-page-stack">
      <div className="eventhub-page-header">
        <div>
          <h1 className="h3 mb-0">Category Management</h1>
          <p className="eventhub-page-lead">Organize the event catalog with reusable categories and clear taxonomy.</p>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="eventhub-card eventhub-form-card p-4">
            <h2 className="h4">Create Category</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormInput label="Name" name="name" register={register} error={errors.name} />
              <FormTextarea label="Description" name="description" register={register} error={errors.description} />
              <button className="btn btn-dark" disabled={loading} type="submit">Save</button>
            </form>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="eventhub-card eventhub-table-card p-4">
            <div className="eventhub-section-title">
              <h2 className="h4 mb-0">Category List</h2>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Name</th><th>Slug</th><th /></tr></thead>
                <tbody>
                  {items.length ? paginatedItems.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td><td>{category.slug}</td>
                      <td className="text-end"><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setPendingDelete(category)}>Delete</button></td>
                    </tr>
                  )) : <tr><td colSpan="3" className="text-center text-muted">No records available</td></tr>}
                </tbody>
              </table>
            </div>
            {items.length > 0 && (
              <div className="mt-4 d-flex justify-content-end">
                <Pagination currentPage={currentPage} totalItems={items.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal show={Boolean(pendingDelete)} title="Delete category" message="Delete this category permanently?" onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
    </div>
  );
}

export default CategoryManagerPage;
