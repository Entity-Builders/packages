import { createRoot } from 'react-dom/client';
import { SharedWebUiGallery } from '../../src/gallery';
import '../../src/styles.css';
import './gallery.css';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SharedWebUiGallery />);
}
