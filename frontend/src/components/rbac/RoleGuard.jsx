import useRBAC from '../../hooks/useRBAC';

function RoleGuard({ permission, fallback = null, children }) {
  const { can } = useRBAC();
  return can(permission) ? children : fallback;
}

export default RoleGuard;
