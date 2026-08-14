import { QueryClient } from "@tanstack/react-query";

// export const queryClientInstance = new QueryClient({
// 	defaultOptions: {
// 		queries: {
// 			refetchOnWindowFocus: false,
// 			retry: 1,
// 		},
// 	},
// });

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      // If this is set to Infinity, data won't refresh automatically
      staleTime: 0,
      // Ensure this is true so it retries if the first one fails
      retry: 1,
    },
  },
});
