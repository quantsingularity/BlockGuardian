import { act, renderHook } from "@testing-library/react-native";
import useForm from "../../src/hooks/useForm";

const validate = (values) => {
  const errors = {};
  if (!values.email) errors.email = "Email is required";
  if (!values.password) errors.password = "Password is required";
  return errors;
};

describe("useForm", () => {
  test("initializes with given values", () => {
    const { result } = renderHook(() =>
      useForm({ email: "", password: "" }, validate),
    );
    expect(result.current.values.email).toBe("");
    expect(result.current.values.password).toBe("");
  });

  test("handles field change", () => {
    const { result } = renderHook(() =>
      useForm({ email: "", password: "" }, validate),
    );
    act(() => {
      result.current.handleChange("email", "test@example.com");
    });
    expect(result.current.values.email).toBe("test@example.com");
  });

  test("validates on submit and prevents call when invalid", async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({ email: "", password: "" }, validate, onSubmit),
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe("Email is required");
  });

  test("calls onSubmit when valid", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useForm({ email: "a@b.com", password: "pass" }, validate, onSubmit),
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass",
    });
  });

  test("resets form", () => {
    const { result } = renderHook(() =>
      useForm({ email: "", password: "" }, validate),
    );
    act(() => {
      result.current.handleChange("email", "changed@test.com");
    });
    act(() => {
      result.current.resetForm();
    });
    expect(result.current.values.email).toBe("");
  });

  test("clears error when field is changed", async () => {
    const { result } = renderHook(() =>
      useForm({ email: "", password: "" }, validate),
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.errors.email).toBe("Email is required");
    act(() => {
      result.current.handleChange("email", "test@test.com");
    });
    expect(result.current.errors.email).toBeUndefined();
  });

  test("sets isSubmitting during async submit", async () => {
    let resolveSubmit;
    const onSubmit = jest.fn(
      () =>
        new Promise((r) => {
          resolveSubmit = r;
        }),
    );
    const { result } = renderHook(() =>
      useForm({ email: "a@b.com", password: "pass" }, () => ({}), onSubmit),
    );
    act(() => {
      result.current.handleSubmit();
    });
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      resolveSubmit();
    });
    expect(result.current.isSubmitting).toBe(false);
  });
});
