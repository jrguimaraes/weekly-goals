import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoriesService } from './categories.service';
import { apiClient } from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('categoriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar todas as categorias sem filtro quando isActive não for informado', async () => {
    const mockCategories = [{ id: '1', name: 'Saúde', isActive: true }];
    vi.mocked(apiClient.get).mockResolvedValue(mockCategories);

    const result = await categoriesService.list();

    expect(result).toEqual(mockCategories);
    expect(apiClient.get).toHaveBeenCalledWith('/categories', { params: undefined });
  });

  it('deve listar categorias com filtro isActive quando informado', async () => {
    const mockCategories = [{ id: '1', name: 'Saúde', isActive: true }];
    vi.mocked(apiClient.get).mockResolvedValue(mockCategories);

    const result = await categoriesService.list(true);

    expect(result).toEqual(mockCategories);
    expect(apiClient.get).toHaveBeenCalledWith('/categories', { params: { isActive: true } });
  });

  it('deve buscar uma categoria por id', async () => {
    const mockCategory = { id: 'uuid-1', name: 'Carreira', isActive: true };
    vi.mocked(apiClient.get).mockResolvedValue(mockCategory);

    const result = await categoriesService.getById('uuid-1');

    expect(result).toEqual(mockCategory);
    expect(apiClient.get).toHaveBeenCalledWith('/categories/uuid-1');
  });

  it('deve criar uma nova categoria com payload correto', async () => {
    const input = { name: 'Estudos', description: 'Cursos e livros', position: 1 };
    const mockCreated = { id: 'uuid-2', ...input, isActive: true };
    vi.mocked(apiClient.post).mockResolvedValue(mockCreated);

    const result = await categoriesService.create(input);

    expect(result).toEqual(mockCreated);
    expect(apiClient.post).toHaveBeenCalledWith('/categories', input);
  });

  it('deve atualizar uma categoria existente', async () => {
    const updateInput = { name: 'Estudos Avançados', position: 2 };
    const mockUpdated = { id: 'uuid-2', name: 'Estudos Avançados', position: 2, isActive: true };
    vi.mocked(apiClient.patch).mockResolvedValue(mockUpdated);

    const result = await categoriesService.update('uuid-2', updateInput);

    expect(result).toEqual(mockUpdated);
    expect(apiClient.patch).toHaveBeenCalledWith('/categories/uuid-2', updateInput);
  });

  it('deve arquivar uma categoria pelo id', async () => {
    const mockArchived = { id: 'uuid-2', name: 'Estudos', isActive: false };
    vi.mocked(apiClient.delete).mockResolvedValue(mockArchived);

    const result = await categoriesService.archive('uuid-2');

    expect(result).toEqual(mockArchived);
    expect(apiClient.delete).toHaveBeenCalledWith('/categories/uuid-2');
  });
});
