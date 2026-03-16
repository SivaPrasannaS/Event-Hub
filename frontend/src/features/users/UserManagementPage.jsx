import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from '../../components/common/ConfirmModal';
import { activateUserAsync, assignRoleAsync, deactivateUserAsync, fetchUsersAsync } from './usersSlice';
import { useToast } from '../../hooks/useToast';

function UserManagementPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, loading } = useSelector((state) => state.users);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  useEffect(() => {
    dispatch(fetchUsersAsync());
  }, [dispatch]);

  const handleRoleChange = async (userId, role) => {
    const result = await dispatch(assignRoleAsync({ id: userId, payload: { role } }));
    if (assignRoleAsync.fulfilled.match(result)) {
      toast.success('Role updated successfully');
    } else {
      toast.error(result.payload || 'Unable to update role');
    }
  };

  const confirmStatusChange = async () => {
    const isActive = pendingStatusChange?.active;
    const thunk = isActive ? deactivateUserAsync(pendingStatusChange.id) : activateUserAsync(pendingStatusChange.id);
    const result = await dispatch(thunk);
    if (deactivateUserAsync.fulfilled.match(result) || activateUserAsync.fulfilled.match(result)) {
      toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error(result.payload || `Unable to ${isActive ? 'deactivate' : 'activate'} user`);
    }
    setPendingStatusChange(null);
  };

  return (
    <div className="eventhub-card eventhub-table-card p-4 page-enter eventhub-page-stack">
      <div>
        <h1 className="h3 mb-2">User Management</h1>
        <p className="eventhub-page-lead">Promote trusted contributors and manage account access without leaving the admin workspace.</p>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Username</th><th>Roles</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.length ? items.map((user) => (
              <tr key={user.id} className={user.active ? '' : 'eventhub-user-row-inactive'}>
                <td>{user.username}</td>
                <td>
                  <select className="form-select eventhub-role-select" value={user.roles[0]} onChange={(event) => handleRoleChange(user.id, event.target.value)} disabled={loading}>
                    <option value="ROLE_USER">ROLE_USER</option>
                    <option value="ROLE_MANAGER">ROLE_MANAGER</option>
                  </select>
                </td>
                <td>
                  <span className={`eventhub-badge ${user.active ? 'eventhub-badge-active' : 'eventhub-badge-inactive'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className={`btn btn-sm ${user.active ? 'btn-outline-danger' : 'btn-outline-dark'}`}
                    onClick={() => setPendingStatusChange(user)}
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            )) : <tr><td colSpan="4" className="text-center text-muted">No records available</td></tr>}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        show={Boolean(pendingStatusChange)}
        title={`${pendingStatusChange?.active ? 'Deactivate' : 'Activate'} user`}
        message={`${pendingStatusChange?.active ? 'Deactivate' : 'Activate'} this account?`}
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatusChange(null)}
      />
    </div>
  );
}

export default UserManagementPage;
