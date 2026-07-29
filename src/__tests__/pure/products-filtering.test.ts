import { describe, it, expect } from 'vitest';

interface LocalProduct {
  name: string;
  category: string;
}

function filterList(list: LocalProduct[], search: string, category: string): LocalProduct[] {
  return list.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });
}

describe('Formulation Filtering Logic', () => {
  const list: LocalProduct[] = [
    { name: 'Dr. Lion Pain Cream', category: 'Cream' },
    { name: 'Dr. Lion Pain Pills', category: 'Pills' },
    { name: 'Moon Light Cream', category: 'Cream' }
  ];

  it('should filter by search query', () => {
    const res = filterList(list, 'Pills', 'all');
    expect(res.length).toBe(1);
    expect(res[0].name).toBe('Dr. Lion Pain Pills');
  });

  it('should filter by category', () => {
    const res = filterList(list, '', 'Cream');
    expect(res.length).toBe(2);
  });
});
