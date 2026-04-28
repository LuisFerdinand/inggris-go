import toast from "react-hot-toast";

export const AppToast = {
  success: (msg: string) =>
    toast.success(msg, {
      duration: 3000,
    }),

  error: (msg: string) =>
    toast.error(msg, {
      duration: 4000,
    }),

  loading: (msg: string) => toast.loading(msg),

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    return toast.promise(promise, messages);
  },
};
