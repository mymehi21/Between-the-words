import { Hero } from '../components/Hero';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Hero onExploreBooks={() => navigate('/books')} />
  );
}
