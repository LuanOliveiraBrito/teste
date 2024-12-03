import React, { useState, useEffect } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { getUsers, createUser, deleteUser } from '../services/api';
import { User } from '../types';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'driver' as 'admin' | 'driver',
    driverName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersResponse = await getUsers();
      setUsers(usersResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setSuccess('Usuário criado com sucesso');
      setNewUser({ username: '', password: '', role: 'driver', driverName: '' });
      fetchData();
    } catch (err) {
      setError('Erro ao criar usuário');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      setSuccess('Usuário removido com sucesso');
      fetchData();
    } catch (err) {
      setError('Erro ao remover usuário');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <Users className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-md mb-4 ${
          error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {error || success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Criar Novo Usuário</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Usuário
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'driver' })}
                required
              >
                <option value="driver">Motorista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {newUser.role === 'driver' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Motorista
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={newUser.driverName}
                  onChange={(e) => setNewUser({ ...newUser, driverName: e.target.value })}
                  required
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Criar Usuário
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Usuários Cadastrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome do Motorista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? 'Administrador' : 'Motorista'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.driverName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};