import { useState } from "react";

/**
 * Custom hook for form handling with validation
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} - Form state and handlers
 */
const useForm = (
  initialValues = {},
  validate = () => ({}),
  onSubmit = () => {},
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  // Handle input blur
  const handleBlur = (name) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate field on blur
    const fieldErrors = validate({ [name]: values[name] });
    if (fieldErrors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldErrors[name],
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const formErrors = validate(values);
    setErrors(formErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // If no errors, submit form
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Set form values programmatically
  const setFormValues = (newValues) => {
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
  };
};

export default useForm;
