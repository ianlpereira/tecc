import React from 'react';
import { Select } from 'antd';
import { useBranches } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';

export function BranchSelector(): React.ReactElement {
  const { data: branches, isLoading } = useBranches();
  const { currentBranch, setCurrentBranch } = useBranchStore();

  const handleChange = (value: number | 'all') => {
    if (value === 'all') {
      setCurrentBranch(null);
    } else {
      const branch = branches?.find(b => b.id === value);
      if (branch) {
        setCurrentBranch(branch);
      }
    }
  };

  return (
    <Select
      style={{ width: 200 }}
      placeholder="Selecione uma filial"
      loading={isLoading}
      value={currentBranch?.id || 'all'}
      onChange={handleChange}
      options={[
        { value: 'all', label: 'Todas as Filiais' },
        ...(branches?.map(branch => ({
          value: branch.id,
          label: branch.is_headquarters ? `${branch.name} (Matriz)` : branch.name,
        })) || []),
      ]}
    />
  );
}

export default BranchSelector;
