import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const SemesterUsageChart = ({ materials = [], requests = [] }) => {
  // Aggregate materials and requests per semester
  const semestersData = [1, 2, 3, 4, 5, 6].map(sem => {
    const matCount = materials.filter(m => Number(m.semester) === sem).length;
    const reqCount = requests.filter(r => Number(r.semester) === sem && r.status === 'approved').length;
    return {
      name: `Sem ${sem}`,
      totalMaterials: matCount,
      approvedRequests: reqCount
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={semestersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="totalMaterials" name="Jumlah Jenis Bahan" fill="#0f2c59" radius={[6, 6, 0, 0]} />
          <Bar dataKey="approvedRequests" name="Frekuensi Pemakaian Disetujui" fill="#00a896" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
