import './index.css';
import Frontpage from './pages/Frontpage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client'; // Correct import for ReactDOM in React 18
import { HelmetProvider } from 'react-helmet-async';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Frontpage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement // Ensure the `root` element exists in `public/index.html`
);

root.render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
);
