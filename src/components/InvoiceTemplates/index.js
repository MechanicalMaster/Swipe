import { Template1 } from './Template1';
import { Template2 } from './Template2';
import { Template3 } from './Template3';

export const templates = {
    modern: {
        id: 'modern',
        name: 'Modern',
        component: Template1,
        thumbnail: '/templates/modern.svg',
        previewImage: '/templates/modern-preview.svg'
    },
    classic: {
        id: 'classic',
        name: 'Classic',
        component: Template2,
        thumbnail: '/templates/classic.svg',
        previewImage: '/templates/classic-preview.svg'
    },
    elegant: {
        id: 'elegant',
        name: 'Elegant',
        component: Template3,
        thumbnail: '/templates/elegant.svg',
        previewImage: '/templates/modern-preview.svg' // Placeholder
    }
};

export const getTemplate = (id) => {
    return templates[id] || templates.modern;
};
