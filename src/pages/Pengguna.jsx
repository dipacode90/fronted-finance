import React from 'react';

export default function Pengguna() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Daftar Manajemen Pengguna</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 text-sm">
              <th className="pb-3">Nama</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="py-3 font-medium text-gray-800">John Doe</td>
              <td className="py-3">john@example.com</td>
              <td className="py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Admin</span></td>
            </tr>
            <tr>
              <td className="py-3 font-medium text-gray-800">Jane Smith</td>
              <td className="py-3">jane@example.com</td>
              <td className="py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Editor</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}