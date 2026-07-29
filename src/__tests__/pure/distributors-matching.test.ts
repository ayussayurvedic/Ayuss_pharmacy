import { describe, it, expect } from 'vitest';

interface LocalLead {
  company_name: string;
  city: string;
}

function filterB2BLeads(list: LocalLead[], search: string): LocalLead[] {
  return list.filter(l => {
    // Exclude contact inquiries from distributor leads list
    const isLead = !l.company_name.startsWith('Enquiry:') && l.company_name !== 'General Contact Enquiry';
    const matchesSearch = l.company_name.toLowerCase().includes(search.toLowerCase()) || 
                          l.city.toLowerCase().includes(search.toLowerCase());
    return isLead && matchesSearch;
  });
}

describe('Distributors List Matching', () => {
  const list: LocalLead[] = [
    { company_name: 'SSP Pharma Dist', city: 'Vijayawada' },
    { company_name: 'Enquiry: General Contact', city: 'Guntur' },
    { company_name: 'Sri Krishna Agencies', city: 'Hyderabad' }
  ];

  it('should filter B2B distributor leads and search', () => {
    const res = filterB2BLeads(list, 'Agencies');
    expect(res.length).toBe(1);
    expect(res[0].company_name).toBe('Sri Krishna Agencies');
  });

  it('should ignore contact enquiries', () => {
    const res = filterB2BLeads(list, '');
    expect(res.length).toBe(2); // Only the B2B distributor records
  });
});
