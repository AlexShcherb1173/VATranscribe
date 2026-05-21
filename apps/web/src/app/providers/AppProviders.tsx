import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { UploadQueueProvider } from "@/features/uploads/model/UploadQueueProvider";
import { I18nProvider } from "@/shared/i18n";
import { ToastProvider } from "@/shared/ui/ToastProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <UploadQueueProvider>
            <RouterProvider router={router} />
          </UploadQueueProvider>
        </ToastProvider>
      </I18nProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
