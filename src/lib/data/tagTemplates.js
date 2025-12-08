// Tag Template Definitions
// These are static template configurations used for barcode label printing

export const TAG_TEMPLATES = [
    {
        template_id: 'MINIMAL',
        name: 'Minimal Tag',
        description: 'Fast printing, least clutter',
        preview_front: '/images/templates/minimal_front.png',
        preview_back: '/images/templates/minimal_back.png',
        fields_front: ['barcode', 'sku', 'category'],
        fields_back: ['netWeight', 'purity'],
        version: 1
    },
    {
        template_id: 'WEIGHT',
        name: 'Weight-Focused Tag',
        description: 'Highlights product weight prominently',
        preview_front: '/images/templates/weight_front.png',
        preview_back: '/images/templates/weight_back.png',
        fields_front: ['barcode', 'netWeight', 'purity'],
        fields_back: ['sku', 'grossWeight', 'price'],
        version: 1
    },
    {
        template_id: 'DETAILED',
        name: 'Detailed Tag',
        description: 'High-detail for premium jewellery',
        preview_front: '/images/templates/detailed_front.png',
        preview_back: '/images/templates/detailed_back.png',
        fields_front: ['barcode', 'sku', 'category', 'netWeight', 'purity'],
        fields_back: ['stoneDetails', 'makingCharges', 'finalPrice'],
        version: 1
    }
];

// Helper to get template by ID
export const getTemplateById = (templateId) => {
    return TAG_TEMPLATES.find(t => t.template_id === templateId);
};

// Default template
export const DEFAULT_TEMPLATE_ID = 'MINIMAL';
