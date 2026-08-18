import { describe, it, expect } from 'vitest';
import { getIndianStates, getDistricts, getCities, findStateByDistrict } from '@/data/india-geo';

describe('Indian Geography & Checkout Auto-Complete Dataset', () => {
  it('returns all 36 states and union territories', () => {
    const states = getIndianStates();
    expect(states.length).toBeGreaterThanOrEqual(36);
    expect(states).toContain('Andhra Pradesh');
    expect(states).toContain('Telangana');
    expect(states).toContain('Karnataka');
    expect(states).toContain('Tamil Nadu');
    expect(states).toContain('Maharashtra');
    expect(states).toContain('Delhi');
  });

  it('filters states by typing query', () => {
    const filtered = getIndianStates('Andhra');
    expect(filtered).toEqual(['Andhra Pradesh']);

    const tFiltered = getIndianStates('Telan');
    expect(tFiltered).toEqual(['Telangana']);
  });

  it('retrieves districts scoped to a specific state', () => {
    const apDistricts = getDistricts('Andhra Pradesh');
    expect(apDistricts).toContain('YSR Kadapa');
    expect(apDistricts).toContain('Chittoor');
    expect(apDistricts).toContain('Visakhapatnam');
    expect(apDistricts).toContain('Tirupati');

    const tsDistricts = getDistricts('Telangana');
    expect(tsDistricts).toContain('Hyderabad');
    expect(tsDistricts).toContain('Warangal');
  });

  it('retrieves major cities for a state', () => {
    const apCities = getCities('Andhra Pradesh');
    expect(apCities).toContain('Yerraguntla');
    expect(apCities).toContain('Proddatur');
    expect(apCities).toContain('Tirupati');
    expect(apCities).toContain('Vijayawada');
  });

  it('infers state correctly from district name', () => {
    expect(findStateByDistrict('YSR Kadapa')).toBe('Andhra Pradesh');
    expect(findStateByDistrict('Cuddapah')).toBe('Andhra Pradesh');
    expect(findStateByDistrict('Hyderabad')).toBe('Telangana');
    expect(findStateByDistrict('Bengaluru Urban')).toBe('Karnataka');
    expect(findStateByDistrict('Chennai')).toBe('Tamil Nadu');
  });
});
