import asyncstorage from '../index';

jest.mock('universal-env', () => {
  return {
    isWeb: true
  };
});

describe('asyncstorage', () => {
  it('setItem', () => {
    const mockFn = jest.fn((val) => {
      expect(val).toBe(null);
    });
    return asyncstorage.setItem('foo', 'bar').then(mockFn);
  });

  it('getItem', () => {
    const mockFn = jest.fn((val) => {
      expect(val).toBe('bar');
    });
    return asyncstorage.getItem('foo').then(mockFn);
  });

  it('length', () => {
    const mockFn = jest.fn((val) => {
      expect(val).toBe(1);
    });
    return asyncstorage.length().then(mockFn);
  });

  it('removeItem', () => {
    const mockFn = jest.fn((val) => {
      expect(val).toBe(null);
    });
    return asyncstorage.removeItem('foo').then(mockFn);
  });

  it('clear', () => {
    const mockFn = jest.fn((val) => {
      expect(val).toBe(null);
    });

    return asyncstorage.setItem('foo', 'bar').then(() => {
      return asyncstorage.setItem('bar', 'foo');
    }).then(() => {
      return asyncstorage.clear().then(mockFn);
    });
  });

  it('getAllKeys', () => {
    const mockFn = jest.fn((val) => {
      expect(val).toEqual(['foo1', 'bar1']);
    });

    return asyncstorage.setItem('foo1', 'bar').then(() => {
      return asyncstorage.setItem('bar1', 'foo');
    }).then(() => {
      return asyncstorage.getAllKeys().then(mockFn);
    });
  });
});
