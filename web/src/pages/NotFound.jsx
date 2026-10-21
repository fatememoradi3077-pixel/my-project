import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/primitives.jsx';

export function NotFound() {
  return (
    <div className="th-container py-20">
      <EmptyState
        icon={Compass}
        title="404 — page not found"
        message="The page you were looking for does not exist or has moved. Try the storefront or search for a product."
        action={
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Link to="/" className="th-btn th-btn-primary th-btn-md">
              Back to home
            </Link>
            <Link to="/shop" className="th-btn th-btn-outline th-btn-md">
              Browse products
            </Link>
          </div>
        }
      />
    </div>
  );
}
