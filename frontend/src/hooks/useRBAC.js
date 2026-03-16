import { useSelector } from 'react-redux';

export const ROLES = {
  USER: 'ROLE_USER',
  MANAGER: 'ROLE_MANAGER',
  ADMIN: 'ROLE_ADMIN',
};

export const PERMISSIONS = {
  'event:create': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'event:publish': [ROLES.MANAGER, ROLES.ADMIN],
  'event:delete_any': [ROLES.MANAGER, ROLES.ADMIN],
  'venue:manage': [ROLES.MANAGER, ROLES.ADMIN],
  'venue:delete': [ROLES.MANAGER, ROLES.ADMIN],
  'media:upload': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'media:delete_any': [ROLES.ADMIN],
  'category:manage': [ROLES.MANAGER, ROLES.ADMIN],
  'category:delete': [ROLES.ADMIN],
  'user:manage': [ROLES.ADMIN],
  'analytics:view': [ROLES.MANAGER, ROLES.ADMIN],
  'rsvp:manage': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
};

export const createRBAC = (currentUser) => {
  const roles = currentUser?.roles || [];
  const can = (permission) => (PERMISSIONS[permission] || []).some((role) => roles.includes(role));
  const canEditEvent = (event) => can('event:publish') || event?.organizerId === currentUser?.id;
  const canDeleteEvent = (event) => can('event:delete_any') || event?.organizerId === currentUser?.id;
  const canDeleteVenue = () => can('venue:delete');
  const canDeleteMedia = (media) => can('media:delete_any') || media?.uploadedById === currentUser?.id;
  return { roles, can, canEditEvent, canDeleteEvent, canDeleteVenue, canDeleteMedia };
};

export const useRBAC = () => {
  const currentUser = useSelector((state) => state.auth.user);
  return createRBAC(currentUser);
};

export default useRBAC;
