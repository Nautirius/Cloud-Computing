import {Providers} from '@/context';
import {Toaster} from '@components/ui/sonner.tsx';
import {Navbar} from "@components/common/Navbar.tsx";
import {Footer} from "@components/common/Footer.tsx";
import {ReactElement, ReactNode} from 'react';


export const MainLayout = ({children}: { children: ReactNode }): ReactElement => {
    return (
        <Providers>
            <Navbar/>
            {children}
            <Toaster/>
            <Footer/>
        </Providers>
    );
};
