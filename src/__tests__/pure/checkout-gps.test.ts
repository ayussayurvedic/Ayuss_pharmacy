import { describe, it, expect } from 'vitest';

function parseAddressDetails(addressObj: any) {
  return {
    city: addressObj.city || addressObj.town || addressObj.village || '',
    state: addressObj.state || '',
    pincode: addressObj.postcode || ''
  };
}

describe('GPS Location Reverse Geocode Address Parser', () => {
  it('should parse city, state, and postcode correctly', () => {
    const raw = {
      city: 'Kadapa',
      state: 'Andhra Pradesh',
      postcode: '516001'
    };
    const parsed = parseAddressDetails(raw);
    expect(parsed.city).toBe('Kadapa');
    expect(parsed.state).toBe('Andhra Pradesh');
    expect(parsed.pincode).toBe('516001');
  });
});
