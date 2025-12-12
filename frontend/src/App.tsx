import {FC} from 'react';
import {createBrowserRouter, Outlet} from 'react-router';
import {RouterProvider} from 'react-router/dom';

import {Home} from '@routes/Home.tsx';
import {Explore} from "@routes/Explore.tsx";
import {Admin} from "@routes/Admin.tsx";
import {MainLayout} from '@layouts/MainLayout.tsx';

interface Props {
}

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <MainLayout>
                <Outlet/>
            </MainLayout>
        ),
        children: [
            {
                index: true,
                element: <Home/>,
            },
            {
                path: 'route',
                element: <Home/>,
            },
            {
                path: 'explore',
                element: <Explore/>,
            },
            {
                path: 'admin',
                element: <Admin/>,
            }
        ],
    },
]);

const App: FC<Props> = () => {
    return <RouterProvider router={router}/>;
};

export default App;
