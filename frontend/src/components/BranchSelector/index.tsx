import React, { useMemo } from 'react';
import { Select } from 'antd';
import { useBranches } from '../../hooks';
import { useBranchStore } from '../../context/branchStore';
import type { Branch } from '../../types';

export function BranchSelector(): React.ReactElement {
  const { data: branches, isLoading } = useBranches(true); // Include hierarchy
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

  // Organize branches hierarchically for display
  const organizedBranches = useMemo(() => {
    if (!branches) return [];

    const headquarters = branches.filter(b => b.is_headquarters);
    const children = branches.filter(b => !b.is_headquarters && b.parent_branch_id);
    const independent = branches.filter(b => !b.is_headquarters && !b.parent_branch_id);

    const organized: Array<{ branch: Branch; isChild: boolean }> = [];

    // Add headquarters with their children
    headquarters.forEach(hq => {
      organized.push({ branch: hq, isChild: false });
      const hqChildren = children.filter(c => c.parent_branch_id === hq.id);
      hqChildren.forEach(child => {
        organized.push({ branch: child, isChild: true });
      });
    });

    // Add independent branches (no parent, not headquarters)
    independent.forEach(branch => {
      organized.push({ branch, isChild: false });
    });

    return organized;
  }, [branches]);

  const formatBranchLabel = (branch: Branch, isChild: boolean): string => {
    const prefix = isChild ? '  ↳ ' : '';
    const icon = branch.is_headquarters ? '📍 ' : '';
    const childrenInfo = branch.children_count && branch.children_count > 0 
      ? ` (${branch.children_count} filiais)` 
      : '';
    
    return `${prefix}${icon}${branch.name}${childrenInfo}`;
  };

  return (
    <Select
      style={{ width: 250 }}
      placeholder="Selecione uma filial"
      loading={isLoading}
      value={currentBranch?.id || 'all'}
      onChange={handleChange}
      options={[
        { value: 'all', label: 'Todas as Filiais' },
        ...organizedBranches.map(({ branch, isChild }) => ({
          value: branch.id,
          label: formatBranchLabel(branch, isChild),
        })),
      ]}
    />
  );
}

export default BranchSelector;
