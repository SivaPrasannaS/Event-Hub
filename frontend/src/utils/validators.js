import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = yup.object({
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, 'Password must include upper, lower, number, and special character')
    .required('Password is required'),
});

export const eventSchema = yup.object({
  title: yup.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters').required('Title is required'),
  description: yup.string().min(20, 'Description must be at least 20 characters').required('Description is required'),
  startDateTime: yup.string().required('Start date time is required'),
  endDateTime: yup
    .string()
    .required('End date time is required')
    .test('end-after-start', 'End date time must be after start date time', function validate(value) {
      const { startDateTime } = this.parent;
      return !startDateTime || !value || new Date(value) > new Date(startDateTime);
    }),
  categoryId: yup.string().required('Category is required'),
  venueId: yup.string().nullable(),
  capacity: yup.number().transform((value, originalValue) => (originalValue === '' ? null : value)).nullable().positive('Capacity must be a positive number'),
  status: yup.string().oneOf(['DRAFT', 'PUBLISHED']),
  tags: yup.string().nullable(),
});

export const venueSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  capacity: yup.number().transform((value, originalValue) => (originalValue === '' ? null : value)).nullable().positive('Capacity must be a positive number'),
});

export const categorySchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').required('Name is required'),
  description: yup.string().nullable(),
});
