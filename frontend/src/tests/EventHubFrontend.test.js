import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import EventListPage from '../features/events/EventListPage';
import EventDetailPage from '../features/events/EventDetailPage';
import EventFormPage from '../features/events/EventFormPage';
import VenueListPage from '../features/venues/VenueListPage';
import VenueFormPage from '../features/venues/VenueFormPage';
import MediaLibraryPage from '../features/media/MediaLibraryPage';
import MediaUploadForm from '../features/media/MediaUploadForm';
import CategoryManagerPage from '../features/categories/CategoryManagerPage';
import RsvpManager from '../features/rsvp/RsvpManager';
import ProtectedRoute from '../components/rbac/ProtectedRoute';
import useRBAC from '../hooks/useRBAC';
import { loginAsync, logout } from '../features/auth/authSlice';
import { uploadMediaAsync } from '../features/media/mediaSlice';
import rsvpReducer, { fetchRsvpAsync } from '../features/rsvp/rsvpSlice';

const baseState = {
  auth: { user: null, token: null, refreshToken: null, loading: false, error: null },
  events: { items: [], total: 0, page: 0, loading: false, error: null, selectedItem: null },
  venues: { items: [], total: 0, loading: false, error: null },
  media: { items: [], total: 0, loading: false, error: null },
  categories: { items: [], loading: false, error: null },
  users: { items: [], loading: false, error: null },
  analytics: { summary: null, monthly: [], byCategory: [], loading: false, error: null },
  rsvp: { rsvps: {}, loading: false, error: null },
};

function createStore(state, dispatch = jest.fn(() => Promise.resolve({ type: 'mock/fulfilled', payload: {} }))) {
  return {
    getState: () => state,
    subscribe: () => () => {},
    dispatch,
  };
}

function renderWithApp(ui, { state = baseState, route = '/', dispatch } = {}) {
  const store = createStore(state, dispatch);
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}

function Routed({ children, path = '/' }) {
  return <Routes><Route path={path} element={children} /></Routes>;
}

function UnauthorizedProbe() {
  return <div>Unauthorized Screen</div>;
}

function LoginSuccessPage() {
  return <div>Events Landing</div>;
}

function RbacProbe({ compute }) {
  const result = compute(useRBAC());
  return <div>{String(result)}</div>;
}

test('day_7_login_page_renders_credentials_form', () => {
  renderWithApp(<LoginPage />);
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
});

test('day_7_login_page_empty_submit_shows_validation_errors', async () => {
  const user = userEvent.setup();
  renderWithApp(<LoginPage />);
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/username is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
});

test('day_7_login_page_short_password_shows_inline_error', async () => {
  const user = userEvent.setup();
  renderWithApp(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'alex');
  await user.type(screen.getByLabelText(/password/i, { selector: 'input' }), '123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
});

test('day_8_login_page_valid_submit_dispatches_login', async () => {
  const user = userEvent.setup();
  const dispatch = jest.fn(() => Promise.resolve({ type: loginAsync.fulfilled.type, payload: { id: 1, username: 'alex', roles: ['ROLE_USER'], accessToken: 'a', refreshToken: 'r' } }));
  renderWithApp(<LoginPage />, { dispatch });
  await user.type(screen.getByLabelText(/username/i), 'alex');
  await user.type(screen.getByLabelText(/password/i, { selector: 'input' }), 'User@123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  expect(dispatch).toHaveBeenCalled();
});

test('day_8_login_page_success_redirects_to_events', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'alex', roles: ['ROLE_USER'] }, token: 'token' } };
  renderWithApp(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/events" element={<LoginSuccessPage />} />
    </Routes>,
    { state, route: '/login' }
  );
  expect(screen.getByText(/events landing/i)).toBeInTheDocument();
});

test('day_8_login_page_unauthorized_response_shows_error_banner', () => {
  const state = { ...baseState, auth: { ...baseState.auth, error: 'Invalid credentials' } };
  renderWithApp(<LoginPage />, { state });
  expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
});

test('day_8_login_page_loading_state_disables_submit', () => {
  const state = { ...baseState, auth: { ...baseState.auth, loading: true } };
  renderWithApp(<LoginPage />, { state });
  expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
});

test('day_8_register_page_duplicate_username_shows_server_error', () => {
  const state = { ...baseState, auth: { ...baseState.auth, error: 'Username already exists' } };
  renderWithApp(<RegisterPage />, { state });
  expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
});

test('day_7_event_list_page_renders_published_events', () => {
  const state = {
    ...baseState,
    events: { ...baseState.events, items: [{ id: 1, title: 'City Meetup', description: 'Community meetup for all attendees', startDateTime: '2026-03-20T10:00:00', categoryName: 'Community' }] },
  };
  renderWithApp(<EventListPage />, { state });
  expect(screen.getByText(/city meetup/i)).toBeInTheDocument();
});

test('day_9_event_list_page_search_filters_by_title', async () => {
  const user = userEvent.setup();
  const state = {
    ...baseState,
    events: { ...baseState.events, items: [
      { id: 1, title: 'Music Night', description: 'A long description for music night', startDateTime: '2026-03-20T10:00:00', categoryName: 'Music' },
      { id: 2, title: 'Art Expo', description: 'A long description for art expo event', startDateTime: '2026-03-20T10:00:00', categoryName: 'Art' },
    ] },
  };
  renderWithApp(<EventListPage />, { state });
  await user.type(screen.getByPlaceholderText(/search events by title/i), 'Music');
  expect(screen.getByRole('heading', { name: /music night/i })).toBeInTheDocument();
  expect(screen.queryByText(/art expo/i)).not.toBeInTheDocument();
});

test('day_9_event_list_page_pagination_renders_controls', () => {
  const state = { ...baseState, events: { ...baseState.events, total: 20 } };
  renderWithApp(<EventListPage />, { state });
  expect(screen.getByText(/previous/i)).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
  expect(screen.getByText(/next/i)).toBeInTheDocument();
});

test('day_9_event_list_page_category_filter_updates_results', async () => {
  const user = userEvent.setup();
  const state = {
    ...baseState,
    categories: { ...baseState.categories, items: [{ id: 1, name: 'Music' }, { id: 2, name: 'Art' }] },
    events: { ...baseState.events, items: [
      { id: 1, title: 'Music Night', description: 'Music description long enough', startDateTime: '2026-03-20T10:00:00', categoryName: 'Music', categoryId: 1 },
      { id: 2, title: 'Art Expo', description: 'Art description long enough for display', startDateTime: '2026-03-20T10:00:00', categoryName: 'Art', categoryId: 2 },
    ] },
  };
  renderWithApp(<EventListPage />, { state });
  await user.selectOptions(screen.getByRole('combobox'), '1');
  expect(screen.getByText(/music night/i)).toBeInTheDocument();
  expect(screen.queryByText(/art expo/i)).not.toBeInTheDocument();
});

test('day_8_event_list_page_manager_sees_delete_for_other_users_event', () => {
  const state = {
    ...baseState,
    auth: { ...baseState.auth, user: { id: 7, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' },
    events: {
      ...baseState.events,
      items: [{ id: 1, title: 'Hackathon', description: 'A detailed description of the hackathon event', organizerId: 8, organizerUsername: 'owner', startDateTime: '2026-03-20T10:00:00' }],
    },
  };
  renderWithApp(<EventListPage />, { state });
  expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
});

test('day_7_event_detail_page_renders_title_and_description', () => {
  const state = { ...baseState, events: { ...baseState.events, selectedItem: { id: 1, title: 'Hackathon', description: 'A detailed description of the hackathon event', organizerUsername: 'owner', startDateTime: '2026-03-20T10:00:00', endDateTime: '2026-03-20T12:00:00' } } };
  renderWithApp(<Routes><Route path="/events/:id" element={<EventDetailPage />} /></Routes>, { state, route: '/events/1' });
  expect(screen.getByRole('heading', { name: /hackathon/i })).toBeInTheDocument();
  expect(screen.getByText(/detailed description/i)).toBeInTheDocument();
});

test('day_8_event_detail_page_owner_sees_edit_action', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 9, username: 'owner', roles: ['ROLE_USER'] }, token: 'token' }, events: { ...baseState.events, selectedItem: { id: 1, title: 'Owner Event', description: 'A detailed description of the owner event', organizerId: 9, organizerUsername: 'owner', startDateTime: '2026-03-20T10:00:00', endDateTime: '2026-03-20T12:00:00' } } };
  renderWithApp(<Routes><Route path="/events/:id" element={<EventDetailPage />} /></Routes>, { state, route: '/events/1' });
  expect(screen.getByRole('link', { name: /edit event/i })).toBeInTheDocument();
});

test('day_8_event_detail_page_manager_sees_delete_for_other_users_event', () => {
  const state = {
    ...baseState,
    auth: { ...baseState.auth, user: { id: 7, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' },
    events: {
      ...baseState.events,
      selectedItem: { id: 1, title: 'Owner Event', description: 'A detailed description of the owner event', organizerId: 9, organizerUsername: 'owner', startDateTime: '2026-03-20T10:00:00', endDateTime: '2026-03-20T12:00:00' },
    },
  };
  renderWithApp(<Routes><Route path="/events/:id" element={<EventDetailPage />} /></Routes>, { state, route: '/events/1' });
  expect(screen.getByRole('button', { name: /delete event/i })).toBeInTheDocument();
});

test('day_8_event_detail_page_non_owner_hides_edit_action', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 10, username: 'viewer', roles: ['ROLE_USER'] }, token: 'token' }, events: { ...baseState.events, selectedItem: { id: 1, title: 'Owner Event', description: 'A detailed description of the owner event', organizerId: 9, organizerUsername: 'owner', startDateTime: '2026-03-20T10:00:00', endDateTime: '2026-03-20T12:00:00' } } };
  renderWithApp(<Routes><Route path="/events/:id" element={<EventDetailPage />} /></Routes>, { state, route: '/events/1' });
  expect(screen.queryByRole('link', { name: /edit event/i })).not.toBeInTheDocument();
});

test('day_7_event_form_page_user_role_hides_status_field', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' } };
  renderWithApp(<EventFormPage />, { state });
  expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
});

test('day_7_event_form_page_manager_role_shows_status_field', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' } };
  renderWithApp(<EventFormPage />, { state });
  expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
});

test('day_7_event_form_page_short_title_shows_validation_error', async () => {
  const user = userEvent.setup();
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' } };
  renderWithApp(<EventFormPage />, { state });
  await user.type(screen.getByLabelText(/title/i), 'abc');
  await user.click(screen.getByRole('button', { name: /save event/i }));
  expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument();
});

test('day_7_event_form_page_short_description_shows_validation_error', async () => {
  const user = userEvent.setup();
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' } };
  renderWithApp(<EventFormPage />, { state });
  await user.type(screen.getByLabelText(/description/i), 'short');
  await user.click(screen.getByRole('button', { name: /save event/i }));
  expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument();
});

test('day_8_event_form_page_edit_mode_preloads_existing_values', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' }, events: { ...baseState.events, selectedItem: { id: 1, title: 'Loaded Event', description: 'Loaded description with more than twenty characters.', startDateTime: '2026-03-20T10:00:00', endDateTime: '2026-03-20T12:00:00', categoryId: 1, venueId: 2, capacity: 90, status: 'PUBLISHED', tags: 'tag1' } } };
  renderWithApp(<Routed path="/events/:id/edit"><EventFormPage /></Routed>, { state, route: '/events/1/edit' });
  expect(screen.getByDisplayValue(/loaded event/i)).toBeInTheDocument();
});

test('day_8_rsvp_manager_renders_options_for_authenticated_user', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' } };
  renderWithApp(<RsvpManager eventId={1} />, { state });
  expect(screen.getByRole('button', { name: 'GOING' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'MAYBE' })).toBeInTheDocument();
});

test('day_8_rsvp_manager_unauthenticated_redirects_to_login', () => {
  renderWithApp(
    <Routes>
      <Route path="/event" element={<RsvpManager eventId={1} />} />
      <Route path="/login" element={<div>Login Screen</div>} />
    </Routes>,
    { route: '/event' }
  );
  expect(screen.getByText(/login screen/i)).toBeInTheDocument();
});

test('day_8_rsvp_manager_shows_current_rsvp_status', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' }, rsvp: { ...baseState.rsvp, rsvps: { 1: { eventId: 1, status: 'GOING' } } } };
  renderWithApp(<RsvpManager eventId={1} />, { state });
  expect(screen.getByText(/current status: going/i)).toBeInTheDocument();
});

test('day_8_rsvp_manager_cancel_action_opens_confirm_modal', async () => {
  const user = userEvent.setup();
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' }, rsvp: { ...baseState.rsvp, rsvps: { 1: { eventId: 1, status: 'GOING' } } } };
  renderWithApp(<RsvpManager eventId={1} />, { state });
  await user.click(screen.getByRole('button', { name: /cancel rsvp/i }));
  expect(screen.getByText(/remove your rsvp/i)).toBeInTheDocument();
});

test('day_8_rsvp_reducer_clears_cached_state_on_logout', () => {
  const state = { ...baseState.rsvp, rsvps: { 1: { eventId: 1, status: 'MAYBE' } }, error: 'Old error' };
  const nextState = rsvpReducer(state, logout());
  expect(nextState.rsvps).toEqual({});
  expect(nextState.error).toBeNull();
});

test('day_8_rsvp_reducer_removes_stale_state_after_not_found', () => {
  const state = { ...baseState.rsvp, rsvps: { 1: { eventId: 1, status: 'MAYBE' } } };
  const action = {
    type: fetchRsvpAsync.rejected.type,
    payload: { message: 'RSVP not found', status: 404, eventId: 1 },
    meta: { arg: 1 },
  };
  const nextState = rsvpReducer(state, action);
  expect(nextState.rsvps).toEqual({});
  expect(nextState.error).toBe('RSVP not found');
});

test('day_7_venue_list_page_renders_venue_cards', () => {
  const state = { ...baseState, venues: { ...baseState.venues, items: [{ id: 1, name: 'Town Hall', city: 'Chennai', country: 'India', capacity: 100 }] } };
  renderWithApp(<VenueListPage />, { state });
  expect(screen.getByText(/town hall/i)).toBeInTheDocument();
});

test('day_8_venue_list_page_manager_sees_delete_action', () => {
  const state = {
    ...baseState,
    auth: { ...baseState.auth, user: { id: 2, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' },
    venues: { ...baseState.venues, items: [{ id: 1, name: 'Town Hall', city: 'Chennai', country: 'India', capacity: 100 }] },
  };
  renderWithApp(<VenueListPage />, { state });
  expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
});

test('day_7_venue_form_page_manager_can_access_create_form', () => {
  renderWithApp(<VenueFormPage />, { state: { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' } } });
  expect(screen.getByText(/create venue/i)).toBeInTheDocument();
});

test('day_8_venue_form_page_user_redirects_to_unauthorized', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'user', roles: ['ROLE_USER'] }, token: 'token' } };
  renderWithApp(
    <Routes>
      <Route path="/venues/new" element={<ProtectedRoute permission="venue:manage"><VenueFormPage /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedProbe />} />
    </Routes>,
    { state, route: '/venues/new' }
  );
  expect(screen.getByText(/unauthorized screen/i)).toBeInTheDocument();
});

test('day_7_venue_form_page_missing_name_shows_validation_error', async () => {
  const user = userEvent.setup();
  renderWithApp(<VenueFormPage />, { state: { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' } } });
  await user.click(screen.getByRole('button', { name: /save venue/i }));
  expect(screen.getByText(/name is required/i)).toBeInTheDocument();
});

test('day_7_media_library_page_renders_media_grid', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' }, media: { ...baseState.media, items: [{ id: 1, originalName: 'poster.png', filename: 'stored-poster.png', mediaType: 'IMAGE', uploadedById: 1, url: '/uploads/stored-poster.png' }] } };
  renderWithApp(<MediaLibraryPage />, { state });
  expect(screen.getByRole('heading', { name: /poster.png/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
});

test('day_9_media_library_page_search_filters_by_filename', async () => {
  const user = userEvent.setup();
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' }, media: { ...baseState.media, items: [
    { id: 1, originalName: 'brochure.pdf', filename: 'brochure.pdf', mediaType: 'DOCUMENT', uploadedById: 1 },
    { id: 2, originalName: 'poster.png', filename: 'poster.png', mediaType: 'IMAGE', uploadedById: 1 },
  ] } };
  renderWithApp(<MediaLibraryPage />, { state });
  await user.type(screen.getByPlaceholderText(/search media by filename/i), 'poster');
  expect(screen.getByRole('heading', { name: /poster.png/i })).toBeInTheDocument();
  expect(screen.queryByText(/brochure.pdf/i)).not.toBeInTheDocument();
});

test('day_8_media_upload_form_accepts_valid_file_and_submits', async () => {
  const user = userEvent.setup();
  const dispatch = jest.fn(() => Promise.resolve({ type: uploadMediaAsync.fulfilled.type, payload: { id: 1 } }));
  renderWithApp(<MediaUploadForm />, { state: { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' } }, dispatch });
  const file = new File(['hello'], 'file.pdf', { type: 'application/pdf' });
  await user.upload(screen.getByLabelText(/upload file/i), file);
  await user.selectOptions(screen.getByLabelText(/media type/i), 'DOCUMENT');
  await user.click(screen.getByRole('button', { name: /upload/i }));
  expect(dispatch).toHaveBeenCalled();
});

test('day_8_media_library_page_delete_opens_confirm_modal', async () => {
  const user = userEvent.setup();
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, username: 'user', roles: ['ROLE_USER'] }, token: 'token' }, media: { ...baseState.media, items: [{ id: 1, originalName: 'brochure.pdf', filename: 'stored-brochure.pdf', mediaType: 'DOCUMENT', uploadedById: 1 }] } };
  renderWithApp(<MediaLibraryPage />, { state });
  await user.click(screen.getByRole('button', { name: /delete/i }));
  expect(screen.getByText(/delete media/i)).toBeInTheDocument();
});

test('day_7_category_manager_page_manager_can_view_category_list', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' }, categories: { ...baseState.categories, items: [{ id: 1, name: 'Music', slug: 'music' }] } };
  renderWithApp(<CategoryManagerPage />, { state });
  expect(screen.getByText(/category list/i)).toBeInTheDocument();
  expect(screen.getByText('Music')).toBeInTheDocument();
});

test('day_8_category_manager_page_user_redirects_to_unauthorized', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'user', roles: ['ROLE_USER'] }, token: 'token' } };
  renderWithApp(
    <Routes>
      <Route path="/categories" element={<ProtectedRoute permission="category:manage"><CategoryManagerPage /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedProbe />} />
    </Routes>,
    { state, route: '/categories' }
  );
  expect(screen.getByText(/unauthorized screen/i)).toBeInTheDocument();
});

test('day_7_category_manager_page_create_form_renders', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' } };
  renderWithApp(<CategoryManagerPage />, { state });
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
});

test('day_8_category_manager_page_delete_opens_confirm_modal', async () => {
  const user = userEvent.setup();
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 2, username: 'manager', roles: ['ROLE_MANAGER'] }, token: 'token' }, categories: { ...baseState.categories, items: [{ id: 1, name: 'Music', slug: 'music' }] } };
  renderWithApp(<CategoryManagerPage />, { state });
  await user.click(screen.getByRole('button', { name: /delete/i }));
  expect(screen.getByText(/delete category/i)).toBeInTheDocument();
});

test('day_8_use_rbac_allows_event_create_for_user', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, roles: ['ROLE_USER'] } } };
  renderWithApp(<RbacProbe compute={(rbac) => rbac.can('event:create')} />, { state });
  expect(screen.getByText('true')).toBeInTheDocument();
});

test('day_8_use_rbac_denies_event_publish_for_user', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, roles: ['ROLE_USER'] } } };
  renderWithApp(<RbacProbe compute={(rbac) => rbac.can('event:publish')} />, { state });
  expect(screen.getByText('false')).toBeInTheDocument();
});

test('day_8_use_rbac_allows_event_publish_for_manager', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, roles: ['ROLE_MANAGER'] } } };
  renderWithApp(<RbacProbe compute={(rbac) => rbac.can('event:publish')} />, { state });
  expect(screen.getByText('true')).toBeInTheDocument();
});

test('day_8_use_rbac_allows_manager_delete_event', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 7, roles: ['ROLE_MANAGER'] } } };
  renderWithApp(<RbacProbe compute={(rbac) => rbac.canDeleteEvent({ organizerId: 8 })} />, { state });
  expect(screen.getByText('true')).toBeInTheDocument();
});

test('day_8_use_rbac_allows_admin_delete_any_event', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 7, roles: ['ROLE_ADMIN'] } } };
  renderWithApp(<RbacProbe compute={(rbac) => rbac.canDeleteEvent({ organizerId: 8 })} />, { state });
  expect(screen.getByText('true')).toBeInTheDocument();
});

test('day_8_use_rbac_allows_manager_delete_venue', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 7, roles: ['ROLE_MANAGER'] } } };
  renderWithApp(<RbacProbe compute={(rbac) => rbac.canDeleteVenue()} />, { state });
  expect(screen.getByText('true')).toBeInTheDocument();
});

test('day_8_protected_route_unauthenticated_redirects_to_login', () => {
  renderWithApp(
    <Routes>
      <Route path="/private" element={<ProtectedRoute><div>Private</div></ProtectedRoute>} />
      <Route path="/login" element={<div>Login Screen</div>} />
    </Routes>,
    { route: '/private' }
  );
  expect(screen.getByText(/login screen/i)).toBeInTheDocument();
});

test('day_8_protected_route_missing_permission_redirects_to_unauthorized', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, roles: ['ROLE_USER'] }, token: 'token' } };
  renderWithApp(
    <Routes>
      <Route path="/private" element={<ProtectedRoute permission="user:manage"><div>Private</div></ProtectedRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedProbe />} />
    </Routes>,
    { state, route: '/private' }
  );
  expect(screen.getByText(/unauthorized screen/i)).toBeInTheDocument();
});

test('day_8_protected_route_with_permission_renders_children', () => {
  const state = { ...baseState, auth: { ...baseState.auth, user: { id: 1, roles: ['ROLE_ADMIN'] }, token: 'token' } };
  renderWithApp(
    <Routes>
      <Route path="/private" element={<ProtectedRoute permission="user:manage"><div>Private Content</div></ProtectedRoute>} />
    </Routes>,
    { state, route: '/private' }
  );
  expect(screen.getByText(/private content/i)).toBeInTheDocument();
});
