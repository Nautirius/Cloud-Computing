import {FC, ReactNode} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

interface ProviderProps {
    children: ReactNode;
}

const queryClient = new QueryClient();

export const Providers: FC<ProviderProps> = ({children}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
